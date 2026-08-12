import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import MyBuildingsPage from "@/pages/my-buildings";

export const Route = createFileRoute("/_home/my-buildings")({
	component: MyBuildings,
	head: () => ({
		meta: [
			{ title: "My buildings | Roomioo" },
			{ name: "description", content: "Manage your Roomioo buildings." }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.MY_BUILDINGS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	})
});

function MyBuildings() {
	return <MyBuildingsPage />;
}
