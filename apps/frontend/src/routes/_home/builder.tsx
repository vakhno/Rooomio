import { ROUTES } from "@shared/routes/constants";
import { createFileRoute } from "@tanstack/react-router";

import BuilderPage from "@/pages/builder";

const parseFloor = (value: unknown) => {
	const floor = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;

	return Number.isInteger(floor) && floor > 0 ? floor : undefined;
};

export const Route = createFileRoute("/_home/builder")({
	component: Builder,
	head: () => ({
		meta: [
			{ title: `Builder | Roomioo` },
			{ name: "description", content: "Build isometric coworking floors and rooms." }
		],
		links: [
			{ rel: "canonical", href: `${(import.meta.env.VITE_APP_URL ?? "").replace(/\/$/, "")}${ROUTES.BUILDER.path}` },
			{ rel: "icon", type: "image/svg+xml", href: "/icon/logo.svg" }
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
