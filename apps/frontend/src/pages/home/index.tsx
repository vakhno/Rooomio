import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Skeleton } from "@shared/design-system/skeleton";
import { useGetSession } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { Hammer, LogIn } from "lucide-react";

const HomePage = () => {
	const { data: session, isLoading } = useGetSession({ apiBaseUrl: import.meta.env.VITE_API_URL });
	const user = session?.user;

	return (
		<div className="grid gap-6 px-4 py-10 md:py-16">
			<Card className="mx-auto w-full max-w-4xl">
				<CardHeader>
					<CardTitle className="text-2xl font-extrabold tracking-normal">
						Booking overview
					</CardTitle>
					<CardDescription>
						Manage coworking rooms, call tables, meeting spaces, and work spots from one floor plan.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
						<p className="text-xs font-extrabold text-muted-foreground">FLOOR BUILDER</p>
						<p className="max-w-xl text-sm font-semibold text-foreground">
							Create the isometric office layout before booking inventory is assigned.
						</p>
					</div>
					{isLoading
						? <Skeleton className="h-10 w-28 rounded-[2px]" />
						: user
							? (
									<Button asChild>
										<Link to="/buildings">
											<Hammer className="size-4" />
											Build
										</Link>
									</Button>
								)
							: (
									<Button variant="secondary" asChild>
										<Link to="/auth/login">
											<LogIn className="size-4" />
											Sign in to build
										</Link>
									</Button>
								)}
				</CardContent>
			</Card>
		</div>
	);
};

export default HomePage;
