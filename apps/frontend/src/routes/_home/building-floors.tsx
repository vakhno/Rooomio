import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuildingFloorsPage from "@/pages/building-floors";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/building-floors")({
	component: BuildingFloors,
	head: () => ({
		meta: [
			{ title: `${content.pages.buildingFloors.title} | ${content.pages.home.title}` },
			{ name: "description", content: content.seo.routes.buildingFloors.description }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDING_FLOORS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => ({
		buildingId: typeof search.buildingId === "string" ? search.buildingId : undefined
	})
});

function BuildingFloors() {
	return <BuildingFloorsPage />;
}
