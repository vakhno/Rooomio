import type { RoomReservationWire } from "@shared/sockets/contracts";

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
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

type CancelReservationDialogProps = {
	onCancel: (scope?: "occurrence" | "series") => void;
	onOpenChange: (open: boolean) => void;
	reservation: RoomReservationWire | null;
};

export function CancelReservationDialog({ onCancel, onOpenChange, reservation }: CancelReservationDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.reservations;

	return (
		<AlertDialog open={Boolean(reservation)} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{content.cancelDialog.title}</AlertDialogTitle>
					<AlertDialogDescription>
						{reservation?.seriesId
							? content.cancelDialog.seriesDescription
							: content.cancelDialog.description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>{content.cancelDialog.keepAction}</AlertDialogCancel>
					{reservation?.seriesId && (
						<AlertDialogAction onClick={() => onCancel("series")}>{content.cancelDialog.cancelSeriesAction}</AlertDialogAction>
					)}
					<AlertDialogAction onClick={() => onCancel("occurrence")}>
						{reservation?.seriesId ? content.cancelDialog.cancelOccurrenceAction : content.cancelDialog.cancelReservationAction}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
