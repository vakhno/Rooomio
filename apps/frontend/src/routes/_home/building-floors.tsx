import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuildingFloorsPage from "@/pages/building-floors";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/building-floors")({
	component: BuildingFloors,
	head: () => ({
		meta: [
			{ title: content.seo.routes.buildingFloors.title },
			{ name: "description", content: content.seo.routes.buildingFloors.description },
			{ name: "keywords", content: content.seo.routes.buildingFloors.keywords },
			{ name: "robots", content: content.seo.routes.buildingFloors.robots },
			{ name: "author", content: content.seo.routes.buildingFloors.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.buildingFloors.ogType },
			{ property: "og:title", content: content.seo.routes.buildingFloors.ogTitle },
			{ property: "og:description", content: content.seo.routes.buildingFloors.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.buildingFloors.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDING_FLOORS.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.buildingFloors.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.buildingFloors.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.buildingFloors.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDING_FLOORS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => ({
		buildingId: typeof search.buildingId === "string" ? search.buildingId : undefined
	})
});

function BuildingFloors() {
	return <BuildingFloorsPage />;
}
