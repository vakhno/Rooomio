import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shared/design-system/card";

import LoginTabs from "@/components/compound/login-tabs";

const LoginPage = () => {
	return (
		<div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-[1fr_440px] md:py-16">
			<section className="hidden md:block">
				<div className="grid max-w-lg gap-5">
					<div className="w-fit rounded-[3px] border-2 border-border bg-selected px-3 py-2 text-xs font-extrabold text-foreground [box-shadow:2px_2px_0_var(--border)]">
						COWORKING ACCESS
					</div>
					<h1 className="max-w-xl text-4xl font-extrabold leading-tight text-foreground">
						Book rooms and work spots.
					</h1>
					<p className="max-w-lg text-base font-semibold leading-relaxed text-muted-foreground">
						Sign in to manage coworking bookings from a crisp 16-bit HUD built for quick room,
						meeting, call, and work-session checks.
					</p>
					<div className="grid max-w-md grid-cols-3 gap-2 pt-2" aria-hidden="true">
						<div className="h-16 rounded-[2px] border-2 border-border bg-secondary [box-shadow:3px_3px_0_var(--border)]" />
						<div className="h-16 rounded-[2px] border-2 border-border bg-primary [box-shadow:3px_3px_0_var(--border)]" />
						<div className="h-16 rounded-[2px] border-2 border-border bg-accent [box-shadow:3px_3px_0_var(--border)]" />
						<div className="col-span-2 h-12 rounded-[2px] border-2 border-border bg-shade-1 [box-shadow:3px_3px_0_var(--border)]" />
						<div className="h-12 rounded-[2px] border-2 border-border bg-muted [box-shadow:3px_3px_0_var(--border)]" />
					</div>
				</div>
			</section>
			<div className="w-full max-w-md justify-self-center">
				<Card>
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-extrabold tracking-normal">
							Booking terminal
						</CardTitle>
						<CardDescription className="text-balance">
							Use your coworking account to manage bookings.
						</CardDescription>
					</CardHeader>
					<CardContent className="pb-2">
						<LoginTabs />
					</CardContent>
					<CardFooter className="flex flex-col gap-4 border-t-2 border-border pt-6">
						<p className="text-center text-xs text-muted-foreground leading-relaxed">
							Access keeps rooms, meetings, work spots, and profile actions behind your account.
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
