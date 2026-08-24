import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuilderPage from "@/pages/builder";

const content = DICTIONARY[DEFAULT_LOCALE];

const parseFloor = (value: unknown) => {
	const floor = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

	return Number.isInteger(floor) && floor > 0 ? floor : undefined;
};

export const Route = createFileRoute("/_home/builder")({
	component: Builder,
	head: () => ({
		meta: [
			{ title: content.seo.routes.builder.title },
			{ name: "description", content: content.seo.routes.builder.description },
			{ name: "keywords", content: content.seo.routes.builder.keywords },
			{ name: "robots", content: content.seo.routes.builder.robots },
			{ name: "author", content: content.seo.routes.builder.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.builder.ogType },
			{ property: "og:title", content: content.seo.routes.builder.ogTitle },
			{ property: "og:description", content: content.seo.routes.builder.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.builder.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDER.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.builder.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.builder.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.builder.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDER.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
		]
	}),
	validateSearch: (search: Record<string, unknown>) => ({
		buildingId: typeof search.buildingId === "string" ? search.buildingId : undefined,
		floor: parseFloor(search.floor),
		mode: search.mode === "new" ? "new" : undefined
	})
});

function Builder() {
	return <BuilderPage />;
}
