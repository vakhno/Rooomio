import type { ReactNode } from "react";

import { createRouter, RouterProvider as TanStackRouterProvider } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { routeTree } from "../routeTree.gen";

const router = createRouter({
	routeTree,
	scrollRestoration: true
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export function RouteProvider({ children }: { children?: ReactNode }) {
	return (
		<>
			{children}
			<TanStackRouterProvider router={router} />
			<TanStackRouterDevtools router={router} />
		</>
	);
}
