import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import ReservationsPage from "@/pages/reservations";

const content = DICTIONARY[DEFAULT_LOCALE];

export const Route = createFileRoute("/_home/reservations")({
	component: Reservations,
	head: () => ({
		meta: [
			{ title: `${content.pages.reservations.title} | ${content.pages.home.title}` },
			{ name: "description", content: content.seo.routes.reservations.description }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.RESERVATIONS.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
		]
	})
});

function Reservations() {
	return <ReservationsPage />;
}
