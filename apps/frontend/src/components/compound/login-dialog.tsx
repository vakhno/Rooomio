import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";

import LoginTabs from "@/components/compound/login-tabs";

interface LoginDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>
						Welcome
					</DialogTitle>
					<DialogDescription>
						Sign in to have access to all features and personal statistic.
					</DialogDescription>
				</DialogHeader>
				<LoginTabs />
			</DialogContent>
		</Dialog>
	);
}
