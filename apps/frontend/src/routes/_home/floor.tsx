import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import FloorPage from "@/pages/floor";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/floor")({
	component: Floor,
	head: () => ({
		meta: [
			{ title: content.seo.routes.floor.title },
			{ name: "description", content: content.seo.routes.floor.description },
			{ name: "keywords", content: content.seo.routes.floor.keywords },
			{ name: "robots", content: content.seo.routes.floor.robots },
			{ name: "author", content: content.seo.routes.floor.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.floor.ogType },
			{ property: "og:title", content: content.seo.routes.floor.ogTitle },
			{ property: "og:description", content: content.seo.routes.floor.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.floor.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.FLOOR.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.floor.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.floor.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.floor.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.FLOOR.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
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
