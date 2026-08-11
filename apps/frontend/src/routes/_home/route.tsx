import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import Header from "@/components/compound/header";

export const Route = createFileRoute("/_home")({
	component: () => HomeLayout()
});

function HomeLayout() {
	const location = useLocation();
	const isCanvasPage = location.pathname === "/builder" || location.pathname === "/floor";

	return (
		<>
			<Header />
			<main className={isCanvasPage ? "mx-auto w-full" : "container mx-auto"}>
				<Outlet />
			</main>
		</>
	);
}
