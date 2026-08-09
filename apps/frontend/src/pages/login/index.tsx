import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@shared/design-system/card";

import LoginTabs from "@/components/compound/login-tabs";

const LoginPage = () => {
	return (
		<div className="flex min-h-[calc(100dvh-3rem)] flex-col items-center justify-center gap-8 px-4 py-10 md:py-16">
			<div className="w-full max-w-md">
				<Card className="border border-border bg-card shadow-sm">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-semibold tracking-tight">
							Welcome
						</CardTitle>
						<CardDescription className="text-balance">
							Sign in to access all features and your personal statistics.
						</CardDescription>
					</CardHeader>
					<CardContent className="pb-2">
						<LoginTabs />
					</CardContent>
					<CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
						<p className="text-center text-xs text-muted-foreground leading-relaxed">
							By signing in, you agree to our rules.
						</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
};

export default LoginPage;
