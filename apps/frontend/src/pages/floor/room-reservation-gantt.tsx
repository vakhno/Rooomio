import type {
	ReservationAck,
	ReservationEndingSoonPayload,
	ReservationStatePayload,
	RoomReservationHold,
	RoomReservationWire
} from "@shared/sockets";
import type { FloorLayout } from "@shared/zod-schemas";
import type { Socket } from "socket.io-client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@shared/design-system/alert-dialog";
import { Button } from "@shared/design-system/button";
import { cn } from "@shared/design-system/cn";
import { Input } from "@shared/design-system/input";
import { ReservationCommitPayloadSchema, ReservationHoldPayloadSchema } from "@shared/sockets";
import { CalendarDays, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];

export type RoomReservation = {
	end: Date;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	start: Date;
	title: string;
};

type SlotRef = {
	day: number;
	slot: number;
};

const VISIBLE_DAYS = 7;
const SLOTS_PER_DAY = 48;
const SLOT_MINUTES = 30;
const MAX_RESERVATION_MINUTES = 4 * 60;
const OFFICE_TIME_ZONE = "Europe/Kyiv";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const sameDay = (a: Date, b: Date) =>
	a.getFullYear() === b.getFullYear()
	&& a.getMonth() === b.getMonth()
	&& a.getDate() === b.getDate();

const startOfToday = () => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);
	return date;
};

const addDays = (date: Date, days: number) => {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
};

const addMinutes = (date: Date, minutes: number) => {
	const next = new Date(date);
	next.setMinutes(next.getMinutes() + minutes);
	return next;
};

const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const formatDate = (date: Date) => new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	year: "numeric"
}).format(date);

const slotIndex = ({ day, slot }: SlotRef) => day * SLOTS_PER_DAY + slot;

const dateFromSlot = (baseDate: Date, index: number) => {
	const day = Math.floor(index / SLOTS_PER_DAY);
	const slot = index % SLOTS_PER_DAY;
	const date = addDays(baseDate, day);
	date.setHours(0, slot * SLOT_MINUTES, 0, 0);
	return date;
};

const minutesFromTime = (value: string) => {
	const [hours = "0", minutes = "0"] = value.split(":");
	return Number(hours) * 60 + Number(minutes);
};

const userTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const officeDateParts = (date: Date) => {
	const parts = new Intl.DateTimeFormat("en-US", {
		day: "numeric",
		hour: "numeric",
		hour12: false,
		minute: "numeric",
		month: "numeric",
		timeZone: OFFICE_TIME_ZONE,
		weekday: "short",
		year: "numeric"
	}).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";

	return {
		day: Number(value("day")),
		hours: Number(value("hour")),
		minutes: Number(value("minute")),
		month: Number(value("month")),
		weekday: value("weekday").toLowerCase(),
		year: Number(value("year"))
	};
};

function overlaps(reservations: RoomReservation[], start: Date, end: Date, excludeId?: string) {
	return reservations.some(reservation =>
		reservation.id !== excludeId
		&& start < reservation.end
		&& end > reservation.start);
}

function overlapsHolds(holds: RoomReservationHold[], start: Date, end: Date, excludeId?: string) {
	return holds.some(hold =>
		hold.id !== excludeId
		&& start < new Date(hold.end)
		&& end > new Date(hold.start));
}

function isInsideRoomHours(room: FloorRoom, start: Date, end: Date) {
	const officeStart = officeDateParts(start);
	const officeEnd = officeDateParts(end);
	const schedule = room.schedule.find(day => day.day.startsWith(officeStart.weekday));

	if (
		!schedule
		|| schedule.dayOff
		|| officeStart.year !== officeEnd.year
		|| officeStart.month !== officeEnd.month
		|| officeStart.day !== officeEnd.day
	) {
		return false;
	}

	const startMinutes = officeStart.hours * 60 + officeStart.minutes;
	const endMinutes = officeEnd.hours * 60 + officeEnd.minutes;

	return startMinutes >= minutesFromTime(schedule.opensAt) && endMinutes <= minutesFromTime(schedule.closesAt);
}

const fromWireReservation = (reservation: RoomReservationWire): RoomReservation => ({
	end: new Date(reservation.end),
	floorId: reservation.floorId,
	id: reservation.id,
	ownerId: reservation.ownerId,
	roomId: reservation.roomId,
	roomName: reservation.roomName,
	start: new Date(reservation.start),
	title: reservation.title
});

export function RoomReservationGantt({
	onCreate,
	onDelete,
	reservations,
	room,
	floorId,
	initialDate,
	currentUserId
}: {
	currentUserId: string;
	floorId: string;
	initialDate?: Date;
	onCreate: (reservation: RoomReservation) => void;
	onDelete: (id: string) => void;
	reservations: RoomReservation[];
	room: FloorRoom;
}) {
	const [baseDate, setBaseDate] = useState(() => initialDate ?? startOfToday());
	const [selectionStart, setSelectionStart] = useState<SlotRef | null>(null);
	const [selectionEnd, setSelectionEnd] = useState<SlotRef | null>(null);
	const [pending, setPending] = useState<{ end: Date; start: Date } | null>(null);
	const [pendingRange, setPendingRange] = useState<{ end: number; start: number } | null>(null);
	const [title, setTitle] = useState("");
	const [holds, setHolds] = useState<RoomReservationHold[]>([]);
	const [socketId, setSocketId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<RoomReservation | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const selectionStartRef = useRef<SlotRef | null>(null);
	const selectionEndRef = useRef<SlotRef | null>(null);
	const holdIdRef = useRef<string | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const days = useMemo(() => Array.from({ length: VISIBLE_DAYS }, (_, day) => addDays(baseDate, day)), [baseDate]);
	const rangeLabel = `${formatDate(days[0] ?? baseDate)} - ${formatDate(days[days.length - 1] ?? baseDate)}`;
	const activeHolds = useMemo(() => holds.filter(hold => hold.roomId === room.id && hold.expiresAt > Date.now()), [holds, room.id]);
	const browserTimeZone = userTimeZone();
	const showOfficeTimeZone = browserTimeZone !== OFFICE_TIME_ZONE;

	const clearLocalSelection = () => {
		selectionStartRef.current = null;
		selectionEndRef.current = null;
		setSelectionStart(null);
		setSelectionEnd(null);
		setPending(null);
		setPendingRange(null);
		setTitle("");
	};

	const selectedRange = useMemo(() => {
		if (!selectionStart || !selectionEnd)
			return pendingRange;

		if (selectionStart.day !== selectionEnd.day)
			return null;

		const start = Math.min(slotIndex(selectionStart), slotIndex(selectionEnd));
		const end = Math.max(slotIndex(selectionStart), slotIndex(selectionEnd));
		return { end, start };
	}, [pendingRange, selectionEnd, selectionStart]);

	const cancelHold = () => {
		const holdId = holdIdRef.current;

		if (holdId)
			socketRef.current?.emit("reservation:hold:cancel", { holdId });

		holdIdRef.current = null;
		setHolds(current => current.filter(hold => hold.id !== holdId));
	};

	const upsertHold = (start: Date, end: Date) => {
		if (!socketRef.current?.connected)
			return;

		if (!holdIdRef.current)
			holdIdRef.current = globalThis.crypto?.randomUUID?.() ?? `${room.id}-${Date.now()}`;

		const payload = {
			end: end.toISOString(),
			floorId,
			holdId: holdIdRef.current,
			roomId: room.id,
			roomName: room.name,
			start: start.toISOString()
		};
		const parsedPayload = ReservationHoldPayloadSchema.safeParse(payload);

		if (!parsedPayload.success) {
			toast.error("Reservation data is invalid.");
			return;
		}

		socketRef.current.emit(
			"reservation:hold:upsert",
			parsedPayload.data,
			(ack: ReservationAck) => {
				if (ack.ok)
					return;

				clearLocalSelection();
				cancelHold();
				toast.error(ack.error);
			}
		);
	};

	const startSelection = (day: number, slot: number) => {
		const start = dateFromSlot(baseDate, day * SLOTS_PER_DAY + slot);
		const end = addMinutes(start, SLOT_MINUTES);

		if (!isInsideRoomHours(room, start, end))
			return;

		if (start < new Date())
			return;

		if (overlaps(reservations, start, end) || overlapsHolds(activeHolds, start, end, holdIdRef.current ?? undefined))
			return;

		setPending(null);
		setPendingRange(null);
		setTitle("");
		holdIdRef.current = globalThis.crypto?.randomUUID?.() ?? `${room.id}-${Date.now()}`;
		selectionStartRef.current = { day, slot };
		selectionEndRef.current = { day, slot };
		setSelectionStart({ day, slot });
		setSelectionEnd({ day, slot });
		upsertHold(start, end);
	};

	const finishSelection = (target?: SlotRef) => {
		const startRef = selectionStartRef.current;
		const endRef = target ?? selectionEndRef.current;

		if (!startRef || !endRef)
			return;

		if (startRef.day !== endRef.day)
			return;

		const startIndex = Math.min(slotIndex(startRef), slotIndex(endRef));
		const endIndex = Math.max(slotIndex(startRef), slotIndex(endRef));
		const start = dateFromSlot(baseDate, startIndex);
		const end = dateFromSlot(baseDate, endIndex + 1);
		const durationMinutes = (end.getTime() - start.getTime()) / 60_000;

		selectionStartRef.current = null;
		selectionEndRef.current = null;
		setSelectionStart(null);
		setSelectionEnd(null);

		if (overlaps(reservations, start, end) || overlapsHolds(activeHolds, start, end, holdIdRef.current ?? undefined)) {
			cancelHold();
			return;
		}

		if (!isInsideRoomHours(room, start, end)) {
			cancelHold();
			return;
		}

		if (start < new Date() || durationMinutes < SLOT_MINUTES || durationMinutes > MAX_RESERVATION_MINUTES) {
			cancelHold();
			return;
		}

		setPending({ end, start });
		setPendingRange({ end: endIndex, start: startIndex });
	};

	const updateSelection = (day: number, slot: number) => {
		if (!selectionStartRef.current)
			return;

		if (day !== selectionStartRef.current.day)
			return;

		const start = dateFromSlot(baseDate, day * SLOTS_PER_DAY + slot);
		const end = addMinutes(start, SLOT_MINUTES);

		if (!isInsideRoomHours(room, start, end))
			return;

		const startIndex = Math.min(slotIndex(selectionStartRef.current), day * SLOTS_PER_DAY + slot);
		const endIndex = Math.max(slotIndex(selectionStartRef.current), day * SLOTS_PER_DAY + slot);
		const rangeStart = dateFromSlot(baseDate, startIndex);
		const rangeEnd = dateFromSlot(baseDate, endIndex + 1);
		const durationMinutes = (rangeEnd.getTime() - rangeStart.getTime()) / 60_000;

		if (durationMinutes > MAX_RESERVATION_MINUTES)
			return;

		if (overlaps(reservations, rangeStart, rangeEnd) || overlapsHolds(activeHolds, rangeStart, rangeEnd, holdIdRef.current ?? undefined))
			return;

		selectionEndRef.current = { day, slot };
		setSelectionEnd({ day, slot });
		upsertHold(rangeStart, rangeEnd);
	};

	const selectCell = (day: number, slot: number) => {
		const start = dateFromSlot(baseDate, day * SLOTS_PER_DAY + slot);
		const end = addMinutes(start, SLOT_MINUTES);

		if (!isInsideRoomHours(room, start, end))
			return;

		if (!selectionStartRef.current) {
			startSelection(day, slot);
			return;
		}

		updateSelection(day, slot);
		finishSelection({ day, slot });
	};

	useEffect(() => {
		const firstWorkDay = room.schedule.find(day => !day.dayOff);
		const opensAt = firstWorkDay ? minutesFromTime(firstWorkDay.opensAt) : 9 * 60;

		scrollRef.current?.scrollTo({ top: Math.max(0, (opensAt / SLOT_MINUTES) * 32 - 40) });
	}, [baseDate, room.id, room.schedule]);

	useEffect(() => {
		const socket = io(import.meta.env.VITE_API_URL, {
			transports: ["websocket"],
			withCredentials: true
		});

		socketRef.current = socket;

		socket.on("connect", () => {
			setSocketId(socket.id ?? null);
			socket.emit("reservation:room:join", { roomId: room.id });
		});

		socket.on("reservation:state", (state: ReservationStatePayload) => {
			setHolds(state.holds);
			state.reservations.forEach(reservation => onCreate(fromWireReservation(reservation)));
		});

		socket.on("reservation:hold:upsert", (hold: RoomReservationHold) => {
			setHolds(current => [...current.filter(item => item.id !== hold.id), hold]);
		});

		socket.on("reservation:hold:clear", ({ holdId }: { holdId: string }) => {
			setHolds(current => current.filter(hold => hold.id !== holdId));
		});

		socket.on("reservation:created", (reservation: RoomReservationWire) => {
			onCreate(fromWireReservation(reservation));
		});

		socket.on("reservation:deleted", ({ id }: { id: string }) => {
			onDelete(id);
		});

		socket.on("reservation:ending-soon", ({ nextReservation, notifyBeforeMinutes, reservation }: ReservationEndingSoonPayload) => {
			const current = fromWireReservation(reservation);
			const next = fromWireReservation(nextReservation);

			toast(`${current.roomName} is booked after you`, {
				description: `${current.title} ends at ${formatTime(current.end)}. ${next.title} starts at ${formatTime(next.start)}.`,
				duration: Math.max(5_000, notifyBeforeMinutes * 1_000)
			});
		});

		socket.on("disconnect", () => {
			if (holdIdRef.current)
				toast.error("Connection lost. Reservation hold was removed.");

			holdIdRef.current = null;
			setSocketId(null);
			setHolds([]);
			clearLocalSelection();
		});

		return () => {
			const holdId = holdIdRef.current;

			if (holdId)
				socket.emit("reservation:hold:cancel", { holdId });

			holdIdRef.current = null;
			socket.disconnect();
			socketRef.current = null;
		};
	}, [onCreate, onDelete, room.id]);

	const confirmPending = () => {
		const trimmedTitle = title.trim();

		if (!pending || !trimmedTitle || trimmedTitle.length > 100)
			return;

		const holdId = holdIdRef.current;

		if (!socketRef.current?.connected || !holdId) {
			onCreate({
				end: pending.end,
				floorId,
				id: globalThis.crypto?.randomUUID?.() ?? `${room.id}-${Date.now()}`,
				ownerId: currentUserId,
				roomId: room.id,
				roomName: room.name,
				start: pending.start,
				title: trimmedTitle
			});
			clearLocalSelection();
			toast.success("Reservation saved.");
			return;
		}

		const parsedPayload = ReservationCommitPayloadSchema.safeParse({ holdId, title: trimmedTitle });

		if (!parsedPayload.success) {
			toast.error("Title must be 1 to 100 characters.");
			return;
		}

		socketRef.current.timeout(5_000).emit("reservation:commit", parsedPayload.data, (error: Error | null, ack?: ReservationAck) => {
			holdIdRef.current = null;
			clearLocalSelection();

			if (error || !ack) {
				toast.error("Reservation failed. Please choose another time range.");
				return;
			}

			if (!ack.ok) {
				toast.error(ack.error);
				return;
			}

			toast.success("Reservation saved.");
		});
	};

	const cancelPending = () => {
		cancelHold();
		clearLocalSelection();
	};

	const renderReservation = (day: number, slot: number) => {
		const current = dateFromSlot(baseDate, day * SLOTS_PER_DAY + slot);
		const reservation = reservations.find(item => current >= item.start && current < item.end);

		if (!reservation)
			return null;

		const isOwn = reservation.ownerId === currentUserId;

		return (
			<button
				type="button"
				className={cn(
					"absolute inset-0.5 overflow-hidden border-2 border-border px-1 text-left text-[10px] font-extrabold text-primary-foreground",
					isOwn ? "bg-secondary hover:bg-secondary-hover" : "bg-accent hover:bg-[#4f79a8]"
				)}
				onPointerDown={event => event.stopPropagation()}
				onClick={(event) => {
					event.stopPropagation();
					if (isOwn)
						setDeleteTarget(reservation);
				}}
				aria-label={`Delete reservation from ${formatTime(reservation.start)} to ${formatTime(reservation.end)}`}
				title={isOwn ? "Cancel reservation" : "Reserved by another user"}
			>
				{sameDay(current, reservation.start) && formatTime(current) === formatTime(reservation.start)
					? `${reservation.title} ${formatTime(reservation.start)}-${formatTime(reservation.end)}`
					: ""}
			</button>
		);
	};

	const deleteReservation = () => {
		if (!deleteTarget)
			return;

		if (socketRef.current?.connected) {
			socketRef.current.emit("reservation:delete", { id: deleteTarget.id, roomId: room.id });
		}
		else {
			onDelete(deleteTarget.id);
		}

		setDeleteTarget(null);
		toast.success("Reservation canceled.");
	};

	const renderHold = (day: number, slot: number) => {
		const current = dateFromSlot(baseDate, day * SLOTS_PER_DAY + slot);
		const hold = activeHolds.find(item => current >= new Date(item.start) && current < new Date(item.end));

		if (!hold)
			return null;

		const start = new Date(hold.start);
		const end = new Date(hold.end);

		return (
			<div
				className="pointer-events-none absolute inset-0.5 overflow-hidden border-2 border-border bg-primary/75 px-1 text-left text-[10px] font-extrabold text-primary-foreground motion-safe:animate-pulse"
				aria-hidden="true"
			>
				{sameDay(current, start) && formatTime(current) === formatTime(start)
					? `${hold.ownerId === socketId ? "Your hold" : "Selecting"} ${formatTime(start)}-${formatTime(end)}`
					: ""}
			</div>
		);
	};

	return (
		<div className="relative min-h-0 min-w-0 select-none space-y-3 overflow-hidden">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-sm font-extrabold text-foreground">{room.name}</p>
					<p className="text-xs font-semibold text-muted-foreground">
						{room.floor}
						{" "}
						-
						{" "}
						{room.capacity}
						{" "}
						places
					</p>
				</div>
				<div className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground">
					<CalendarDays className="size-4" />
					7 days, 30 min slots
				</div>
				{showOfficeTimeZone && (
					<p className="basis-full text-xs font-semibold text-muted-foreground">
						Times are shown in
						{" "}
						{browserTimeZone}
						. Office hours are checked in
						{" "}
						{OFFICE_TIME_ZONE}
						.
					</p>
				)}
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-2 border-border bg-card p-2">
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={() => {
						cancelPending();
						setBaseDate(current => addDays(current, -VISIBLE_DAYS));
					}}
					aria-label="Show previous 7 days"
				>
					<ChevronLeft className="size-4" />
				</Button>
				<div className="text-center text-sm font-extrabold text-foreground">{rangeLabel}</div>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					onClick={() => {
						cancelPending();
						setBaseDate(current => addDays(current, VISIBLE_DAYS));
					}}
					aria-label="Show next 7 days"
				>
					<ChevronRight className="size-4" />
				</Button>
			</div>

			<div ref={scrollRef} className="max-h-[58svh] w-full min-w-0 overflow-auto rounded-[3px] border-2 border-border bg-card overscroll-contain">
				<div className="grid min-w-[736px] grid-cols-[64px_repeat(7,minmax(96px,1fr))]">
					<div className="sticky top-0 left-0 z-30 border-r-2 border-b-2 border-border bg-card" />
					{days.map(day => (
						<div
							key={day.toISOString()}
							className={cn(
								"sticky top-0 z-20 border-r-2 border-b-2 border-border bg-card px-1 py-2 text-center text-[11px] font-extrabold",
								sameDay(day, startOfToday()) && "bg-selected"
							)}
						>
							<div>{DAY_NAMES[day.getDay()]}</div>
							<div>{day.getDate()}</div>
						</div>
					))}

					{Array.from({ length: SLOTS_PER_DAY }, (_, slot) => {
						const time = formatTime(dateFromSlot(baseDate, slot));

						return (
							<div key={slot} className="contents">
								<div className="sticky left-0 z-10 flex h-8 items-center justify-end border-r-2 border-b border-border bg-card pr-2 text-[10px] font-extrabold text-muted-foreground">
									{time}
								</div>
								{days.map((day, dayIndex) => {
									const currentIndex = dayIndex * SLOTS_PER_DAY + slot;
									const cellStart = dateFromSlot(baseDate, currentIndex);
									const cellEnd = addMinutes(cellStart, SLOT_MINUTES);
									const selected = selectedRange && currentIndex >= selectedRange.start && currentIndex <= selectedRange.end;
									const held = overlapsHolds(activeHolds, cellStart, cellEnd, holdIdRef.current ?? undefined);
									const reserved = overlaps(reservations, cellStart, cellEnd);
									const unavailable = !isInsideRoomHours(room, cellStart, cellEnd) || held || reserved;

									return (
										<div
											key={`${day.toISOString()}-${slot}`}
											className={cn(
												"relative h-8 border-r border-b border-border/40 bg-shade-0 hover:bg-hover",
												unavailable && "cursor-not-allowed bg-muted/70 hover:bg-muted/70",
												selected && !unavailable && "bg-primary outline-2 -outline-offset-2 outline-border hover:bg-primary"
											)}
											onPointerDown={(event) => {
												event.preventDefault();
												selectCell(dayIndex, slot);
											}}
											onPointerEnter={() => {
												updateSelection(dayIndex, slot);
											}}
											onPointerMove={() => {
												updateSelection(dayIndex, slot);
											}}
										>
											{renderReservation(dayIndex, slot)}
											{!reserved && renderHold(dayIndex, slot)}
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
				<Trash2 className="size-4" />
				Click one cell to start a range, hover or scroll to the end time, then click another cell to finish.
			</div>

			{pending && (
				<div className="absolute inset-0 z-40 flex items-center justify-center bg-shade-5/50 p-4">
					<div role="dialog" aria-modal="true" aria-labelledby="reservation-confirm-title" className="w-full max-w-md rounded-[3px] border-2 border-border bg-card p-5 text-card-foreground [box-shadow:6px_6px_0_var(--border)]">
						<div className="space-y-2">
							<h3 id="reservation-confirm-title" className="text-lg font-extrabold">Confirm reservation</h3>
							<p className="text-sm font-semibold text-muted-foreground">
								Reserve
								{" "}
								{room.name}
								{" "}
								for this time range?
							</p>
						</div>
						<div className="mt-4 rounded-[3px] border-2 border-border bg-selected p-3 text-sm font-extrabold text-foreground">
							{formatDate(pending.start)}
							{" "}
							{formatTime(pending.start)}
							-
							{formatTime(pending.end)}
						</div>
						<form
							className="mt-4 space-y-5"
							onSubmit={(event) => {
								event.preventDefault();
								confirmPending();
							}}
						>
							<label className="block space-y-2 text-sm font-extrabold text-foreground">
								<span>Title</span>
								<Input
									autoFocus
									maxLength={100}
									required
									value={title}
									onChange={event => setTitle(event.currentTarget.value)}
									placeholder="Planning session"
								/>
							</label>
							<div className="flex flex-wrap justify-end gap-2">
								<Button type="button" variant="outline" onClick={cancelPending}>Cancel</Button>
								<Button type="submit" disabled={!title.trim()}>Confirm reservation</Button>
							</div>
						</form>
					</div>
				</div>
			)}
			<AlertDialog open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel reservation?</AlertDialogTitle>
						<AlertDialogDescription>
							This removes your reservation from the room schedule.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep reservation</AlertDialogCancel>
						<AlertDialogAction onClick={deleteReservation}>Cancel reservation</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
