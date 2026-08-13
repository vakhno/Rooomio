import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shared/design-system/card";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { Link } from "@tanstack/react-router";

import LoginTabs from "@/components/compound/login-tabs";

const LoginPage = () => {
	const appName = DICTIONARY[DEFAULT_LOCALE].pages.home.title;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.login;

	return (
		<div className="mx-auto grid min-h-[calc(100dvh-3rem)] w-full max-w-5xl items-center justify-items-center px-4 py-10 md:justify-items-end md:py-16">
			<div className="w-full max-w-md justify-self-center">
				<Card>
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-extrabold tracking-normal">
							<Link to="/" className="inline-flex rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
								{appName}
							</Link>
						</CardTitle>
						<CardDescription className="text-balance">
							{content.description}
						</CardDescription>
					</CardHeader>
					<CardContent className="pb-2">
						<LoginTabs />
					</CardContent>
					<CardFooter className="flex flex-col gap-4 border-t-2 border-border pt-6">
						<p className="text-center text-xs text-muted-foreground leading-relaxed">
							{content.footer}
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
