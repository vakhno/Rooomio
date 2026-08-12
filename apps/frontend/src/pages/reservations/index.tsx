import type { RoomReservationWire } from "@shared/sockets";
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
import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Skeleton } from "@shared/design-system/skeleton";
import { useGetSession } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

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
	onCancel,
	reservation
}: {
	canCancel?: boolean;
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
					Cancel
				</Button>
			)}
		</div>
	);
}

export default function ReservationsPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
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

		return () => {
			socket.disconnect();
			socketRef.current = null;
		};
	}, [apiBaseUrl, userId]);

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

	const cancelReservation = () => {
		if (!cancelTarget)
			return;

		socketRef.current?.emit("reservation:delete", {
			id: cancelTarget.id,
			roomId: cancelTarget.roomId
		});
		setCancelTarget(null);
		toast.success("Reservation canceled.");
	};

	if (isLoading)
		return <Skeleton className="min-h-[420px] w-full rounded-[3px]" />;

	return (
		<div className="px-4 pb-8">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border-2 border-border bg-card p-4 [box-shadow:4px_4px_0_var(--border)]">
				<div>
					<h1 className="text-xl font-extrabold text-foreground">My reservations</h1>
					<p className="text-sm font-semibold text-muted-foreground">All times are shown in your browser timezone.</p>
				</div>
				<Badge>
					<CalendarDays className="mr-1 size-4" />
					{upcoming.length}
					{" "}
					upcoming
				</Badge>
			</div>

			<section className="mb-5 overflow-hidden rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:3px_3px_0_var(--border)]">
				<div className="border-b-2 border-border bg-selected p-3 text-sm font-extrabold">Upcoming</div>
				{upcoming.length
					? upcoming.map(reservation => <ReservationRow key={reservation.id} canCancel reservation={reservation} onCancel={setCancelTarget} />)
					: <p className="p-4 text-sm font-semibold text-muted-foreground">No upcoming reservations.</p>}
			</section>

			<section className="overflow-hidden rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:3px_3px_0_var(--border)]">
				<div className="border-b-2 border-border bg-card p-3 text-sm font-extrabold">Past</div>
				{past.length
					? past.slice(0, pastLimit).map(reservation => <ReservationRow key={reservation.id} reservation={reservation} />)
					: <p className="p-4 text-sm font-semibold text-muted-foreground">No past reservations.</p>}
				{past.length > pastLimit && (
					<div className="border-t-2 border-border p-3">
						<Button type="button" variant="outline" onClick={() => setPastLimit(current => current + pageSize)}>Load more</Button>
					</div>
				)}
			</section>

			<AlertDialog open={Boolean(cancelTarget)} onOpenChange={open => !open && setCancelTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel reservation?</AlertDialogTitle>
						<AlertDialogDescription>
							Only your own reservations can be canceled.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Keep reservation</AlertDialogCancel>
						<AlertDialogAction onClick={cancelReservation}>Cancel reservation</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
