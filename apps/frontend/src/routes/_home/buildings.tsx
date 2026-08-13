import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuildingsPage from "@/pages/buildings";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/buildings")({
	component: Buildings,
	head: () => ({
		meta: [
			{ title: `${content.pages.buildings.title} | ${content.pages.home.title}` },
			{ name: "description", content: content.seo.routes.buildings.description }
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
