import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Skeleton } from "@shared/design-system/skeleton";
import { useGetSession } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";

export default function ProfilePage() {
	const { data: session, isLoading } = useGetSession({ apiBaseUrl: import.meta.env.VITE_API_URL });

	const user = session?.user;
	const userEmail = user?.email ?? "";
	const userName = user?.name || userEmail.split("@")[0];

	return (
		<div className="container mx-auto grid max-w-3xl gap-6 px-4 py-10 md:py-16">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-extrabold tracking-normal">
						Coworking record
					</CardTitle>
					<CardDescription>
						Your account details from your sign-in provider.
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
													{userName ? userName.substring(0, 2).toUpperCase() : "??"}
												</div>
											</div>
											<div className="grid gap-3">
												<div className="rounded-[3px] border-2 border-border bg-shade-1 p-3">
													<p className="text-xs font-extrabold text-muted-foreground">NAME</p>
													<p className="truncate text-lg font-extrabold text-foreground">
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
									</>
								)
							: (
									<p className="text-sm text-muted-foreground">
										No session found. If you expected to see your profile, try signing in again.
									</p>
								)}
					<div className="flex flex-wrap gap-2 pt-2">
						<Button variant="outline" size="sm" asChild>
							<Link to="/">
								<ArrowLeft className="size-4" />
								Back to booking overview
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
