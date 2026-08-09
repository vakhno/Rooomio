import { Button } from "@shared/design-system/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@shared/design-system/dialog";

interface DialogModalProps {
	className?: string;
	formId?: string;
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	title: string;
	description?: string;
	children?: React.ReactNode;
	isCancelVisible?: boolean;
	cancelTitle?: string;
	submitTitle: string;
	onSubmit?: () => void;
	onCancel?: () => void;
}

function DialogModal({
	formId,
	isOpen,
	setOpen,
	title,
	description,
	children,
	cancelTitle,
	isCancelVisible,
	submitTitle,
	onSubmit,
	onCancel
}: DialogModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description
						? <DialogDescription>{description}</DialogDescription>
						: null}
				</DialogHeader>
				<div className="overflow-hidden">
					{children}
				</div>
				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DialogModal;
