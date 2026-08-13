import type { Building } from "@shared/zod-schemas";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useBuildings } from "@shared/queries";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Layers3 } from "lucide-react";
import { useState } from "react";

import { BuildingDetailsDialog } from "./building-details-dialog";

const BuildingsPage = () => {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.buildings;
	const navigate = useNavigate();
	const buildings = useBuildings({ apiBaseUrl });
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const list = buildings.data ?? [];
	const openFloor = (floorId: string) => {
		void navigate({ to: "/floor", search: { floorId } });
	};

	return (
		<div className="grid gap-6 px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-normal">
						<Building2 className="size-6" />
						{content.title}
					</CardTitle>
					<CardDescription>{content.description}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					{!buildings.isLoading && list.length === 0 && (
						<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
							<p className="text-sm font-extrabold text-foreground">{content.noBuildingsTitle}</p>
							<p className="text-sm font-semibold text-muted-foreground">{content.noBuildingsDescription}</p>
						</div>
					)}

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{list.map(building => (
							<button
								key={building.id}
								className="cursor-pointer rounded-[3px] border-2 border-border bg-card p-4 text-left [box-shadow:3px_3px_0_var(--border)] transition-transform hover:-translate-y-0.5"
								type="button"
								onClick={() => setSelectedBuilding(building)}
							>
								<div className="flex items-center justify-between gap-3">
									<p className="text-base font-extrabold text-foreground">{building.name}</p>
									<Layers3 className="size-5 text-muted-foreground" />
								</div>
								<p className="mt-1 text-sm font-semibold text-muted-foreground">{building.address}</p>
								<p className="mt-3 text-xs font-extrabold text-muted-foreground">
									{building.floorCount}
									{" "}
									{content.floorsLabel}
								</p>
							</button>
						))}
					</div>
				</CardContent>
			</Card>

			<BuildingDetailsDialog
				apiBaseUrl={apiBaseUrl}
				building={selectedBuilding}
				onOpenChange={open => !open && setSelectedBuilding(null)}
				onOpenFloor={openFloor}
			/>
		</div>
	);
};

export default BuildingsPage;
