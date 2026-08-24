import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/pages/home";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/")({
	component: Home,
	head: () => ({
		meta: [
			{ title: content.seo.routes.home.title },
			{ name: "description", content: content.seo.routes.home.description },
			{ name: "keywords", content: content.seo.routes.home.keywords },
			{ name: "robots", content: content.seo.routes.home.robots },
			{ name: "author", content: content.seo.routes.home.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.home.ogType },
			{ property: "og:title", content: content.seo.routes.home.ogTitle },
			{ property: "og:description", content: content.seo.routes.home.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.home.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.HOME.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.home.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.home.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.home.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.HOME.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify(content.seo.routes.home.jsonLd)
			}
		]
	})
});

function Home() {
	return (
		<HomePage />
	);
}
