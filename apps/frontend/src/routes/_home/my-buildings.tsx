import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import MyBuildingsPage from "@/pages/my-buildings";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/my-buildings")({
	component: MyBuildings,
	head: () => ({
		meta: [
			{ title: `${content.pages.myBuildings.title} | ${content.pages.home.title}` },
			{ name: "description", content: content.seo.routes.myBuildings.description }
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
