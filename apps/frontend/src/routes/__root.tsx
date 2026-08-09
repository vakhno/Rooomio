import { getSession, useGetSession } from "@shared/queries";
import { ROUTES } from "@shared/routes/constants";
import { isAdminRoleRequiredPage, isAuthRequiredPage, isBlockedDuringAuthPage, pickRootSearchQueries } from "@shared/routes/utils";
import { ROLES } from "@shared/zod-schemas";
import { createRootRoute, HeadContent, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { useTheme } from "@/hooks/use-theme";

export const Route = createRootRoute({
	beforeLoad: async ({ location }) => {
		const { pathname } = location;
		const isAuthRequired = isAuthRequiredPage(pathname);
		const isBlockedDuringAuth = isBlockedDuringAuthPage(pathname);
		const isAdminRoleRequired = isAdminRoleRequiredPage(pathname);
		const apiBaseUrl = import.meta.env.VITE_API_URL;

		if (isBlockedDuringAuth) {
			const session = await getSession({ apiBaseUrl });

			if (session?.user) {
				return redirect({ to: ROUTES.HOME.path, replace: true });
			}

			return;
		}

		if (isAuthRequired) {
			const session = await getSession({ apiBaseUrl });

			if (!session?.user) {
				return redirect({ to: ROUTES.LOGIN.path, replace: true });
			}

			return;
		}

		if (isAdminRoleRequired) {
			const session = await getSession({ apiBaseUrl });

			if (session?.user) {
				const user = session.user;

				if (user) {
					const { role } = user;

					if (role !== ROLES.ADMIN) {
						return redirect({ to: ROUTES.HOME.path, replace: true });
					}
				}
			}
		}
	},
	component: () => RootLayout(),
	validateSearch: (search: Record<string, unknown>) => {
		return pickRootSearchQueries(search);
	}
});

function RootLayout() {
	useEffect(() => {
	}, []);
	useTheme();

	useGetSession({
		apiBaseUrl: import.meta.env.VITE_API_URL,
		options: {
			refetchIntervalInBackground: true,
			refetchOnWindowFocus: true,
			refetchInterval: 10 * 60 * 1000,
			staleTime: 10 * 60 * 1000
		}
	});

	return (
		<>
			<HeadContent />
			<Outlet />
		</>
	);
}
