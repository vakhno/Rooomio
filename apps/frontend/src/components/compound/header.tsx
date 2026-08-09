import { Button } from "@shared/design-system/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@shared/design-system/dialog";
import { Separator } from "@shared/design-system/separator";
import { Skeleton } from "@shared/design-system/skeleton";
import { useGetSession, useLogout } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, Moon, Sun, User } from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
	className?: string;
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
	}
	return name.substring(0, 2).toUpperCase();
}

const Header = ({ className = "" }: HeaderProps) => {
	const { theme, toggleTheme } = useTheme();
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const { data: session, isLoading } = useGetSession({ apiBaseUrl });
	const logoutMutation = useLogout({ apiBaseUrl });
	const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
	const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

	const handleToggleTheme = () => {
		toggleTheme();
	};

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		setIsProfileDialogOpen(false);
	};

	const user = session?.user;
	const avatarUrl = user?.image ?? (user as { picture?: string } | null)?.picture;
	const userName = user?.name || user?.email?.split("@")[0] || "User";
	const userEmail = user?.email || "";

	return (
		<header className={cn("border border-t-0 container mx-auto bg-card sticky top-0 z-40 h-[var(--header-height)] mb-[var(--header-margin-bottom)] rounded-bl-xl rounded-br-xl px-6 flex items-center justify-between", className)}>
			<Link
				to="/"
				className="flex items-center gap-1"
			>
				<span className="font-semibold text-xl">
					App
				</span>
			</Link>
			<div className="flex items-center gap-2">
				<Button onClick={handleToggleTheme} variant="ghost" size="icon">
					{theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
				</Button>
				{isLoading
					? (
							<Skeleton className="h-10 w-10 rounded-full" />
						)
					: user
						? (
								<>
									<Button
										variant="ghost"
										size="icon-lg"
										className="relative rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors p-0"
										aria-label="User menu"
										onClick={() => setIsProfileDialogOpen(true)}
									>
										{avatarUrl
											? (
													<img
														src={avatarUrl}
														alt={userName}
														className="h-full w-full object-cover"
													/>
												)
											: (
													<div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
														{getInitials(userName)}
													</div>
												)}
									</Button>
									<Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
										<DialogContent className="sm:max-w-md">
											<DialogHeader>
												<DialogTitle>Profile</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<div className="flex flex-col items-center gap-1">
													{avatarUrl
														? (
																<img
																	src={avatarUrl}
																	alt={userName}
																	className="h-16 w-16 rounded-full object-cover"
																/>
															)
														: (
																<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
																	{getInitials(userName)}
																</div>
															)}
													<div className="flex flex-col items-center gap-1">
														<p className="font-medium text-base truncate">{userName}</p>
														{userEmail && (
															<p className="text-sm text-muted-foreground truncate">{userEmail}</p>
														)}
													</div>
												</div>
												<Separator />
												<Button variant="secondary" className="w-full justify-start gap-2" asChild>
													<Link to="/profile" onClick={() => setIsProfileDialogOpen(false)}>
														<User className="h-4 w-4" />
														Profile
													</Link>
												</Button>
												<Button
													variant="destructive"
													className="w-full justify-start gap-2"
													onClick={handleLogout}
													disabled={logoutMutation.isPending}
												>
													{logoutMutation.isPending ? "Logging out..." : "Logout"}
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</>
							)
						: (
								<Button variant="secondary" asChild>
									<Link to="/auth/login">Sign in</Link>
								</Button>
							)}
				<Button
					variant="ghost"
					size="icon"
					aria-label="Menu"
					onClick={() => setIsMenuDialogOpen(true)}
				>
					<Menu className="h-5 w-5" />
				</Button>
				<Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
					<DialogContent className="sm:max-w-sm">
						<DialogHeader>
							<DialogTitle>
								Menu
							</DialogTitle>
							<DialogDescription>
								Select what you want to visit.
							</DialogDescription>
						</DialogHeader>
						<nav className="mx-auto flex w-full flex-col gap-2">
							<Button
								className="w-full justify-between gap-2"
								asChild
								onClick={() => setIsMenuDialogOpen(false)}
							>
								<Link to="/" className="flex w-full items-center">
									Home
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</Button>
						</nav>
					</DialogContent>
				</Dialog>
			</div>
		</header>
	);
};

export default Header;
