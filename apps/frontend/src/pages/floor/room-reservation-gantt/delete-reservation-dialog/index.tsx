import type { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

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

type DeleteReservationDialogProps = {
	content: typeof DICTIONARY[typeof DEFAULT_LOCALE]["pages"]["floor"]["reservationGantt"];
	onDelete: (scope?: "occurrence" | "series") => void;
	onOpenChange: (open: boolean) => void;
	reservation: { seriesId?: string } | null;
};

export function DeleteReservationDialog({ content, onDelete, onOpenChange, reservation }: DeleteReservationDialogProps) {
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
						<AlertDialogAction onClick={() => onDelete("series")}>{content.cancelDialog.cancelSeriesAction}</AlertDialogAction>
					)}
					<AlertDialogAction onClick={() => onDelete("occurrence")}>
						{reservation?.seriesId ? content.cancelDialog.cancelOccurrenceAction : content.cancelDialog.cancelReservationAction}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
