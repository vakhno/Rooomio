import type { ReservationEndingSoonPayload, RoomReservationWire } from "@shared/sockets/contracts";
import type { Socket } from "socket.io-client";

import { Button } from "@shared/design-system/button";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useGetSession } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

import { CancelReservationDialog } from "./cancel-reservation-dialog";

const pageSize = 10;

const formatDate = (date: Date) => new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	year: "numeric"
}).format(date);

const formatTime = (date: Date) => new Intl.DateTimeFormat(undefined, {
	hour: "2-digit",
	minute: "2-digit"
}).format(date);

const weekStartIso = (date: Date) => {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() - start.getDay());
	return start.toISOString();
};

function ReservationRow({
	canCancel,
	content,
	onCancel,
	reservation
}: {
	canCancel?: boolean;
	content: typeof DICTIONARY[typeof DEFAULT_LOCALE]["pages"]["reservations"];
	onCancel?: (reservation: RoomReservationWire) => void;
	reservation: RoomReservationWire;
}) {
	const start = new Date(reservation.start);
	const end = new Date(reservation.end);

	return (
		<div className="grid gap-2 border-b-2 border-border bg-card p-3 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
			<Link
				to="/floor"
				search={{
					floorId: reservation.floorId,
					roomId: reservation.roomId,
					weekStart: weekStartIso(start)
				}}
				className="min-w-0 space-y-1 hover:text-primary"
			>
				<p className="truncate text-sm font-extrabold text-foreground">{reservation.title}</p>
				<p className="text-xs font-semibold text-muted-foreground">
					{formatDate(start)}
					{" "}
					{formatTime(start)}
					-
					{formatTime(end)}
					{" | "}
					{reservation.roomName}
				</p>
			</Link>
			{canCancel && onCancel && (
				<Button type="button" variant="destructive" className="gap-2" onClick={() => onCancel(reservation)}>
					<Trash2 className="size-4" />
					{content.cancelAction}
				</Button>
			)}
		</div>
	);
}

export default function ReservationsPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.reservations;
	const { data: session, isLoading } = useGetSession({ apiBaseUrl });
	const [reservations, setReservations] = useState<RoomReservationWire[]>([]);
	const [pastLimit, setPastLimit] = useState(pageSize);
	const [cancelTarget, setCancelTarget] = useState<RoomReservationWire | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const userId = session?.user.id;

	useEffect(() => {
		if (!userId)
			return;

		const socket = io(apiBaseUrl, {
			transports: ["websocket"],
			withCredentials: true
		});

		socketRef.current = socket;

		const load = () => socket.emit("reservation:my:list");

		socket.on("connect", load);
		socket.on("reservation:my:state", (items: RoomReservationWire[]) => {
			setReservations(items);
		});
		socket.on("reservation:my:changed", (ownerId: string) => {
			if (ownerId === userId)
				load();
		});
		socket.on("reservation:ending-soon", ({ nextReservation, notifyBeforeMinutes, reservation }: ReservationEndingSoonPayload) => {
			const currentEnd = new Date(reservation.end);
			const nextStart = new Date(nextReservation.start);

			toast(`${reservation.roomName} ${content.endingSoonToast.titleSuffix}`, {
				description: `${reservation.title} ${content.endingSoonToast.endsAt} ${formatTime(currentEnd)}. ${nextReservation.title} ${content.endingSoonToast.startsAt} ${formatTime(nextStart)}.`,
				duration: Math.max(5_000, notifyBeforeMinutes * 1_000)
			});
		});

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, [
		apiBaseUrl,
		content.endingSoonToast.endsAt,
		content.endingSoonToast.startsAt,
		content.endingSoonToast.titleSuffix,
		userId
	]);

	const { past, upcoming } = useMemo(() => {
		const now = new Date();
		const own = reservations.filter(reservation => reservation.ownerId === userId);

		return {
			past: own
				.filter(reservation => new Date(reservation.end) <= now)
				.sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime()),
			upcoming: own
				.filter(reservation => new Date(reservation.end) > now)
				.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
		};
	}, [reservations, userId]);

	const cancelReservation = (scope: "occurrence" | "series" = "occurrence") => {
		if (!cancelTarget)
			return;

		socketRef.current?.emit("reservation:delete", {
			id: cancelTarget.id,
			roomId: cancelTarget.roomId,
			scope
		});
		setCancelTarget(null);
		toast.success(scope === "series" ? content.cancelSeriesSuccess : content.cancelSuccess);
	};

	if (isLoading)
		return <Skeleton className="min-h-[420px] w-full rounded-[3px]" />;

	return (
		<div className="px-4 pb-8">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-2 border-border bg-card p-4 [box-shadow:4px_4px_0_var(--border)]">
				<div>
					<h1 className="text-xl font-extrabold text-foreground">{content.title}</h1>
					<p className="text-sm font-semibold text-muted-foreground">{content.timezoneNote}</p>
				</div>
				<Button asChild>
					<Link to="/buildings">
						<CalendarDays className="size-4" />
						{content.bookRoomAction}
					</Link>
				</Button>
			</div>

			<section className="mb-5 overflow-hidden rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:3px_3px_0_var(--border)]">
				<div className="border-b-2 border-border bg-selected p-3 text-sm font-extrabold">{content.upcomingHeading}</div>
				{upcoming.length
					? upcoming.map(reservation => <ReservationRow key={reservation.id} canCancel content={content} reservation={reservation} onCancel={setCancelTarget} />)
					: <p className="p-4 text-center text-sm font-semibold text-muted-foreground">{content.noUpcoming}</p>}
			</section>

			<section className="overflow-hidden rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:3px_3px_0_var(--border)]">
				<div className="border-b-2 border-border bg-card p-3 text-sm font-extrabold">{content.pastHeading}</div>
				{past.length
					? past.slice(0, pastLimit).map(reservation => <ReservationRow key={reservation.id} content={content} reservation={reservation} />)
					: <p className="p-4 text-center text-sm font-semibold text-muted-foreground">{content.noPast}</p>}
				{past.length > pastLimit && (
					<div className="border-t-2 border-border p-3">
						<Button type="button" variant="outline" onClick={() => setPastLimit(current => current + pageSize)}>{content.loadMoreAction}</Button>
					</div>
				)}
			</section>

			<CancelReservationDialog
				onCancel={cancelReservation}
				onOpenChange={open => !open && setCancelTarget(null)}
				reservation={cancelTarget}
			/>
		</div>
	);
}
