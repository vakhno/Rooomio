import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import ReservationsPage from "@/pages/reservations";

export const Route = createFileRoute("/_home/reservations")({
	component: Reservations,
	head: () => ({
		meta: [
			{ title: "My reservations | Roomioo" },
			{ name: "description", content: "View and cancel your room reservations." }
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
