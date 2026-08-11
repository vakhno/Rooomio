import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import FloorPage from "@/pages/floor";

export const Route = createFileRoute("/_home/floor")({
	component: Floor,
	head: () => ({
		meta: [
			{ title: `Floor | Roomioo` },
			{ name: "description", content: "View coworking floor rooms and layout." }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.FLOOR.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => ({
		floorId: typeof search.floorId === "string" ? search.floorId : undefined
	})
});

function Floor() {
	return <FloorPage />;
}
