import type { ReactNode } from "react";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@shared/design-system/alert-dialog";
import { Button } from "@shared/design-system/button";

interface AlertDialogModalProps {
	children?: ReactNode;
	isOpen: boolean;
	setOpen?: (open: boolean) => void;
	formId?: string;
	title: string;
	description?: string;
	isCancelVisible?: boolean;
	submitTitle: string;
	cancelTitle?: string;
	onSubmit?: () => void;
	onCancel?: () => void;
}

function AlertDialogModal({
	children,
	isOpen,
	setOpen,
	formId,
	title,
	description,
	cancelTitle,
	isCancelVisible,
	submitTitle,
	onSubmit,
	onCancel
}: AlertDialogModalProps) {
	return (
		<AlertDialog open={isOpen} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description
						? <AlertDialogDescription>{description}</AlertDialogDescription>
						: null}
				</AlertDialogHeader>
				<div className="overflow-hidden">
					{children}
				</div>
				<AlertDialogFooter>
					{isCancelVisible
						? (
								<Button variant="outline" onClick={onCancel}>
									{cancelTitle}
								</Button>
							)
						: null}
					{formId
						? (
								<Button type="submit" form={formId}>
									{submitTitle}
								</Button>
							)
						: (
								<Button onClick={onSubmit}>
									{submitTitle}
								</Button>
							)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default AlertDialogModal;
