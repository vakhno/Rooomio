import { createFileRoute, Outlet } from "@tanstack/react-router";

import Header from "@/components/compound/header";

export const Route = createFileRoute("/_home")({
	component: () => HomeLayout()
});

function HomeLayout() {
	return (
		<>
			<Header />
			<main className="container mx-auto">
				<Outlet />
			</main>
		</>
	);
}
