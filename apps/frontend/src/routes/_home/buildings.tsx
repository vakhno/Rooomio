import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuildingsPage from "@/pages/buildings";

export const Route = createFileRoute("/_home/buildings")({
	component: Buildings,
	head: () => ({
		meta: [
			{ title: `Buildings | Roomioo` },
			{ name: "description", content: "Manage buildings before creating floors and rooms." }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDINGS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	})
});

function Buildings() {
	return <BuildingsPage />;
}
