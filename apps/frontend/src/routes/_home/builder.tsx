import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuilderPage from "@/pages/builder";

export const Route = createFileRoute("/_home/builder")({
	component: Builder,
	head: () => ({
		meta: [
			{ title: `Builder | Roomioo` },
			{ name: "description", content: "Build isometric coworking floors and rooms." }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDER.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => ({
		buildingId: typeof search.buildingId === "string" ? search.buildingId : undefined
	})
});

function Builder() {
	return <BuilderPage />;
}
