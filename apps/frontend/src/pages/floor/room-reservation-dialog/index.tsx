import type { FloorLayout } from "@shared/zod-schemas";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

import { type RoomReservation, RoomReservationGantt } from "../room-reservation-gantt";

type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];

type RoomReservationDialogProps = {
	currentUserId: string;
	floorId: string;
	initialDate?: Date;
	onCreate: (reservation: RoomReservation) => void;
	onDelete: (id: string) => void;
	onOpenChange: (open: boolean) => void;
	reservations: RoomReservation[];
	room: FloorRoom | null;
};

export function RoomReservationDialog({
	currentUserId,
	floorId,
	initialDate,
	onCreate,
	onDelete,
	onOpenChange,
	reservations,
	room
}: RoomReservationDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.floor;

	return (
		<Dialog open={Boolean(room)} onOpenChange={onOpenChange}>
			<DialogContent className="h-[calc(100svh-2rem)] w-[calc(100vw-2rem)] min-w-0 overflow-hidden sm:max-w-[calc(100vw-2rem)]">
				<DialogHeader>
					<DialogTitle>{content.reservationDialog.title}</DialogTitle>
					<DialogDescription>
						{content.reservationDialog.description}
					</DialogDescription>
				</DialogHeader>
				{room && (
					<RoomReservationGantt
						room={room}
						currentUserId={currentUserId}
						floorId={floorId}
						initialDate={initialDate}
						reservations={reservations.filter(reservation => reservation.roomId === room.id)}
						onCreate={onCreate}
						onDelete={onDelete}
						content={content.reservationGantt}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
