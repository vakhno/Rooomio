import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import ReservationsPage from "@/pages/reservations";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/reservations")({
	component: Reservations,
	head: () => ({
		meta: [
			{ title: content.seo.routes.reservations.title },
			{ name: "description", content: content.seo.routes.reservations.description },
			{ name: "keywords", content: content.seo.routes.reservations.keywords },
			{ name: "robots", content: content.seo.routes.reservations.robots },
			{ name: "author", content: content.seo.routes.reservations.author },
			{ name: "theme-color", content: content.seo.defaults.themeColor },
			{ name: "viewport", content: content.seo.defaults.viewport },
			{ property: "og:type", content: content.seo.routes.reservations.ogType },
			{ property: "og:title", content: content.seo.routes.reservations.ogTitle },
			{ property: "og:description", content: content.seo.routes.reservations.ogDescription },
			{ property: "og:site_name", content: content.seo.routes.reservations.ogSiteName },
			{ property: "og:locale", content: content.seo.defaults.ogLocale },
			{ property: "og:url", content: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.RESERVATIONS.path}` },
			{ property: "og:image", content: content.seo.defaults.ogImage },
			{ property: "og:image:width", content: content.seo.defaults.ogImageWidth },
			{ property: "og:image:height", content: content.seo.defaults.ogImageHeight },
			{ property: "og:image:alt", content: content.seo.defaults.ogImageAlt },
			{ name: "twitter:card", content: content.seo.routes.reservations.twitterCard },
			{ name: "twitter:title", content: content.seo.routes.reservations.twitterTitle },
			{ name: "twitter:description", content: content.seo.routes.reservations.twitterDescription },
			{ name: "twitter:site", content: content.seo.defaults.twitterSite },
			{ name: "twitter:image", content: content.seo.defaults.twitterImage },
			{ name: "twitter:image:width", content: content.seo.defaults.twitterImageWidth },
			{ name: "twitter:image:height", content: content.seo.defaults.twitterImageHeight }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.RESERVATIONS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" },
			{ rel: "apple-touch-icon", href: "/icon/logo.svg" }
		]
	})
});

function Reservations() {
	return <ReservationsPage />;
}
