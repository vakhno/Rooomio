import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

import LoginTabs from "@/components/compound/login-tabs";

interface LoginDialogProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].components.loginDialog;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>
						{content.title}
					</DialogTitle>
					<DialogDescription>
						{content.description}
					</DialogDescription>
				</DialogHeader>
				<LoginTabs />
			</DialogContent>
		</Dialog>
	);
}
