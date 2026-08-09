import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/pages/home";

export const Route = createFileRoute("/_home/")({
	component: Home,
	head: () => {
		return ({
			meta: [
				{ title: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.title },
				{ name: "description", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.description },
				{ name: "keywords", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.keywords },
				{ name: "robots", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.robots },
				{ name: "author", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.author },
				{ name: "theme-color", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.themeColor },
				{ name: "viewport", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.viewport },
				{ property: "og:type", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.ogType },
				{ property: "og:title", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.ogTitle },
				{ property: "og:description", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.ogDescription },
				{ property: "og:site_name", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.ogSiteName },
				{ property: "og:locale", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.ogLocale },
				{ property: "og:url", content: import.meta.env.VITE_APP_URL ?? "" },
				{ property: "og:image", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.ogImage },
				{ property: "og:image:width", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.ogImageWidth },
				{ property: "og:image:height", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.ogImageHeight },
				{ property: "og:image:alt", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.ogImageAlt },
				{ name: "twitter:card", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.twitterCard },
				{ name: "twitter:title", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.twitterTitle },
				{ name: "twitter:description", content: DICTIONARY[DEFAULT_LOCALE].seo.routes.home.twitterDescription },
				{ name: "twitter:site", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.twitterSite },
				{ name: "twitter:image", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.twitterImage },
				{ name: "twitter:image:width", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.twitterImageWidth },
				{ name: "twitter:image:height", content: DICTIONARY[DEFAULT_LOCALE].seo.defaults.twitterImageHeight }
			],
			links: [
				{ rel: "canonical", href: import.meta.env.VITE_APP_URL ?? "" },
				{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
				{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
			],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify(DICTIONARY[DEFAULT_LOCALE].seo.routes.home.jsonLd)
				}
			]
		});
	}
});

function Home() {
	return (
		<HomePage />
	);
}
