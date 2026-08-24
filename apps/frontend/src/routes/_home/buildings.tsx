import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuildingsPage from "@/pages/buildings";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/buildings")({
	component: Buildings,
	head: () => ({
		meta: [
			{ title: content.seo.routes.buildings.title },
			{ name: "description", content: content.seo.routes.buildings.description },
			{ name: "keywords", content: content.seo.routes.buildings.keywords },
			{ name: "robots", content: content.seo.routes.buildings.robots },
			{ name: "author", content: content.seo.routes.buildings.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.buildings.ogType },
			{ property: "og:title", content: content.seo.routes.buildings.ogTitle },
			{ property: "og:description", content: content.seo.routes.buildings.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.buildings.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDINGS.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.buildings.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.buildings.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.buildings.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDINGS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
		]
	})
});

function Buildings() {
	return <BuildingsPage />;
}
