import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useGetSession } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Building2, CalendarDays, Mail, User } from "lucide-react";

export default function ProfilePage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.profile;
	const { data: session, isLoading } = useGetSession({ apiBaseUrl });

	const user = session?.user;
	const userEmail = user?.email ?? "";
	const userName = user?.name || userEmail.split("@")[0];

	return (
		<div className="container mx-auto grid max-w-3xl gap-6 px-4 py-10 md:py-16">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-extrabold tracking-normal">
						{content.title}
					</CardTitle>
					<CardDescription>
						{content.description}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{isLoading
						? (
								<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
									<Skeleton className="size-24 shrink-0 rounded-[3px]" />
									<div className="flex w-full flex-col gap-3">
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-full max-w-sm" />
										<Skeleton className="h-4 w-32" />
									</div>
								</div>
							)
						: user
							? (
									<>
										<div className="grid gap-4 sm:grid-cols-[160px_1fr]">
											<div className="grid place-items-center rounded-[3px] border-2 border-border bg-shade-1 p-4">
												<div className="grid size-24 place-items-center rounded-[3px] border-2 border-border bg-selected text-2xl font-extrabold text-foreground [box-shadow:3px_3px_0_var(--border)]">
													{userName ? userName.substring(0, 2).toUpperCase() : content.avatarFallback}
												</div>
											</div>
											<div className="grid gap-3">
												<div className="flex min-w-0 items-center gap-3 rounded-[3px] border-2 border-border bg-shade-1 p-3">
													<User className="size-5 shrink-0" />
													<p className="truncate text-sm font-semibold text-muted-foreground">
														{userName}
													</p>
												</div>
												{userEmail && (
													<div className="flex min-w-0 items-center gap-3 rounded-[3px] border-2 border-border bg-shade-1 p-3">
														<Mail className="size-5 shrink-0" />
														<p className="truncate text-sm font-semibold text-muted-foreground">
															{userEmail}
														</p>
													</div>
												)}
											</div>
										</div>
										<div className="grid gap-3 rounded-[3px] border-2 border-border bg-shade-1 p-3">
											<p className="text-xs font-extrabold text-muted-foreground">{content.workspaceLinksLabel}</p>
											<Button variant="secondary" className="justify-between gap-2" asChild>
												<Link to="/reservations">
													<span className="inline-flex items-center gap-2">
														<CalendarDays className="size-4" />
														{content.reservationsAction}
													</span>
													<ArrowUpRight className="size-4" />
												</Link>
											</Button>
											<Button variant="secondary" className="justify-between gap-2" asChild>
												<Link to="/my-buildings">
													<span className="inline-flex items-center gap-2">
														<Building2 className="size-4" />
														{content.buildingsAction}
													</span>
													<ArrowUpRight className="size-4" />
												</Link>
											</Button>
										</div>
									</>
								)
							: (
									<p className="text-sm text-muted-foreground">
										{content.noSession}
									</p>
								)}
				</CardContent>
			</Card>
		</div>
	);
}
