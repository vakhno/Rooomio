import type { Building } from "@shared/zod-schemas";

import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useMyBuildings } from "@shared/queries";
import { Building2, Layers3, Plus } from "lucide-react";
import { useState } from "react";

import { CreateBuildingDialog } from "./create-building-dialog";
import { MyBuildingDetailsDialog } from "./my-building-details-dialog";

export default function MyBuildingsPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.myBuildings;
	const buildings = useMyBuildings({ apiBaseUrl });
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const myBuildings = buildings.data ?? [];

	return (
		<div className="grid gap-6 px-4 py-8">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-normal">
								<Building2 className="size-6" />
								{content.title}
							</CardTitle>
							<CardDescription>{content.description}</CardDescription>
						</div>
						<Button size="sm" onClick={() => setIsCreateOpen(true)}>
							<Plus className="size-4" />
							{content.createBuildingAction}
						</Button>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4">
					{buildings.isLoading
						? <Skeleton className="h-24 w-full rounded-[3px]" />
						: myBuildings.length > 0
							? (
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{myBuildings.map(building => (
											<button
												key={building.id}
												className="rounded-[3px] border-2 border-border bg-card p-4 text-left [box-shadow:3px_3px_0_var(--border)] transition-transform hover:-translate-y-0.5"
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
								)
							: (
									<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
										<p className="text-sm font-extrabold text-foreground">{content.noBuildingsTitle}</p>
										<p className="text-sm font-semibold text-muted-foreground">{content.noBuildingsDescription}</p>
									</div>
								)}
				</CardContent>
			</Card>

			<CreateBuildingDialog
				apiBaseUrl={apiBaseUrl}
				onCreated={setSelectedBuilding}
				onOpenChange={setIsCreateOpen}
				open={isCreateOpen}
			/>
			<MyBuildingDetailsDialog
				apiBaseUrl={apiBaseUrl}
				building={selectedBuilding}
				onOpenChange={open => !open && setSelectedBuilding(null)}
			/>
		</div>
	);
}
