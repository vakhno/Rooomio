import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import FloorPage from "@/pages/floor";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/floor")({
	component: Floor,
	head: () => ({
		meta: [
			{ title: `${content.seo.routeNames.floor} | ${content.pages.home.title}` },
			{ name: "description", content: content.seo.routes.floor.description }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.FLOOR.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => {
		const result: { floorId?: string; roomId?: string; weekStart?: string } = {};

		if (typeof search.floorId === "string")
			result.floorId = search.floorId;

		if (typeof search.roomId === "string")
			result.roomId = search.roomId;

		if (typeof search.weekStart === "string")
			result.weekStart = search.weekStart;

		return result;
	}
});

function Floor() {
	return <FloorPage />;
}
