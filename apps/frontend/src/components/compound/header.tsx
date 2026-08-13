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
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useGetSession, useLogout } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, CalendarDays, LogOut, Menu, Moon, Sun, User } from "lucide-react";
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
	const content = DICTIONARY[DEFAULT_LOCALE].components.header;
	const appName = DICTIONARY[DEFAULT_LOCALE].pages.home.title;
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
	const userName = user?.name || user?.email?.split("@")[0] || content.userFallback;
	const userEmail = user?.email || "";

	return (
		<header className={cn("container sticky top-3 z-40 mx-auto mb-[var(--header-margin-bottom)] mt-3 flex min-h-[var(--header-height)] flex-wrap items-center justify-between gap-3 rounded-[3px] border-2 border-border bg-card px-4 py-3 [box-shadow:4px_4px_0_var(--border)] sm:px-6", className)}>
			<Link
				to="/"
				className="flex min-w-0 items-center gap-3"
			>
				<span className="grid size-10 shrink-0 place-items-center rounded-[2px] border-2 border-border bg-primary text-primary-foreground [box-shadow:2px_2px_0_var(--border)]">
					<CalendarDays className="size-5" />
				</span>
				<span className="min-w-0">
					<span className="block truncate text-xl font-extrabold leading-none text-foreground">
						{appName}
					</span>
				</span>
			</Link>
			<div className="flex items-center gap-2">
				<Button onClick={handleToggleTheme} variant="ghost" size="icon" aria-label={content.toggleThemeLabel}>
					{theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
				</Button>
				{isLoading
					? (
							<Skeleton className="h-11 w-11 rounded-[2px]" />
						)
					: user
						? (
								<>
									<Button
										variant="ghost"
										size="icon-lg"
										className="relative overflow-hidden rounded-[2px] p-0"
										aria-label={content.userMenuLabel}
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
													<div className="flex h-full w-full items-center justify-center bg-selected text-sm font-extrabold text-foreground">
														{getInitials(userName)}
													</div>
												)}
									</Button>
									<Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
										<DialogContent className="sm:max-w-md">
											<DialogHeader>
												<DialogTitle>{content.profileDialog.title}</DialogTitle>
												<DialogDescription>
													{content.profileDialog.description}
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-5">
												<div className="flex items-center gap-4 rounded-[3px] border-2 border-border bg-shade-1 p-3">
													<div className="shrink-0">
														{avatarUrl
															? (
																	<img
																		src={avatarUrl}
																		alt={userName}
																		className="h-16 w-16 rounded-[3px] border-2 border-border object-cover [box-shadow:2px_2px_0_var(--border)]"
																	/>
																)
															: (
																	<div className="flex h-16 w-16 items-center justify-center rounded-[3px] border-2 border-border bg-selected text-lg font-extrabold text-foreground [box-shadow:2px_2px_0_var(--border)]">
																		{getInitials(userName)}
																	</div>
																)}
													</div>
													<div className="min-w-0 flex-1">
														<p className="truncate text-base font-extrabold text-foreground">{userName}</p>
														{userEmail && (
															<p className="truncate text-sm font-semibold text-muted-foreground">{userEmail}</p>
														)}
													</div>
												</div>
												<Separator className="h-0.5" />
												<div className="grid gap-3">
													<Button variant="secondary" className="w-full justify-between gap-2" asChild>
														<Link to="/reservations" onClick={() => setIsProfileDialogOpen(false)}>
															<span className="inline-flex items-center gap-2">
																<CalendarDays className="h-4 w-4" />
																{content.profileDialog.reservationsAction}
															</span>
															<ArrowUpRight className="h-4 w-4" />
														</Link>
													</Button>
													<Button variant="secondary" className="w-full justify-between gap-2" asChild>
														<Link to="/my-buildings" onClick={() => setIsProfileDialogOpen(false)}>
															<span className="inline-flex items-center gap-2">
																<Building2 className="h-4 w-4" />
																{content.profileDialog.buildingsAction}
															</span>
															<ArrowUpRight className="h-4 w-4" />
														</Link>
													</Button>
													<Button variant="secondary" className="w-full justify-between gap-2" asChild>
														<Link to="/profile" onClick={() => setIsProfileDialogOpen(false)}>
															<span className="inline-flex items-center gap-2">
																<User className="h-4 w-4" />
																{content.profileDialog.profileAction}
															</span>
															<ArrowUpRight className="h-4 w-4" />
														</Link>
													</Button>
													<Button
														variant="destructive"
														className="w-full justify-start gap-2"
														onClick={handleLogout}
														disabled={logoutMutation.isPending}
													>
														<LogOut className="h-4 w-4" />
														{logoutMutation.isPending ? content.profileDialog.logoutPending : content.profileDialog.logoutAction}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</>
							)
						: (
								<Button variant="secondary" asChild>
									<Link to="/auth/login">{content.signInAction}</Link>
								</Button>
							)}
				<Button
					variant="ghost"
					size="icon"
					aria-label={content.menuDialog.triggerLabel}
					onClick={() => setIsMenuDialogOpen(true)}
				>
					<Menu className="h-5 w-5" />
				</Button>
				<Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
					<DialogContent className="sm:max-w-sm">
						<DialogHeader>
							<DialogTitle>
								{content.menuDialog.title}
							</DialogTitle>
							<DialogDescription>
								{content.menuDialog.description}
							</DialogDescription>
						</DialogHeader>
						<nav className="mx-auto flex w-full flex-col gap-3">
							<Button
								className="w-full justify-between gap-2"
								asChild
								onClick={() => setIsMenuDialogOpen(false)}
							>
								<Link to="/" className="flex w-full items-center">
									{content.menuDialog.homeAction}
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</Button>
							{user && (
								<Button
									variant="secondary"
									className="w-full justify-between gap-2"
									asChild
									onClick={() => setIsMenuDialogOpen(false)}
								>
									<Link to="/buildings" className="flex w-full items-center">
										{content.menuDialog.buildingsAction}
										<ArrowUpRight className="h-4 w-4" />
									</Link>
								</Button>
							)}
						</nav>
					</DialogContent>
				</Dialog>
			</div>
		</header>
	);
};

export default Header;
