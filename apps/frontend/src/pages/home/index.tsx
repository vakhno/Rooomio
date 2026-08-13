import { Button } from "@shared/design-system/button";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { Link } from "@tanstack/react-router";
import { Building2, CalendarDays } from "lucide-react";

const HomePage = () => {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.home;

	return (
		<div className="grid min-h-[calc(100dvh-var(--header-height)-var(--header-margin-bottom)-2rem)] place-items-center px-4 py-10 text-center md:py-16">
			<section className="mx-auto grid w-full max-w-2xl justify-items-center gap-6">
				<div className="grid gap-3">
					<h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
						{content.title}
					</h1>
					<p className="max-w-xl text-base font-semibold leading-relaxed text-muted-foreground">
						{content.description}
					</p>
				</div>
				<div className="flex w-full max-w-xs flex-col justify-center gap-3 sm:max-w-none sm:flex-row">
					<Button asChild>
						<Link to="/buildings">
							<CalendarDays className="size-4" />
							{content.bookAction}
						</Link>
					</Button>
					<Button variant="secondary" asChild>
						<Link to="/my-buildings">
							<Building2 className="size-4" />
							{content.createAction}
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
