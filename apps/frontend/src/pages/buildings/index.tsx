import type { Building, FloorPlan } from "@shared/zod-schemas";

import { Badge } from "@shared/design-system/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Skeleton } from "@shared/design-system/skeleton";
import { useBuildingFloorPlans, useBuildings } from "@shared/queries";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Layers3 } from "lucide-react";
import { useState } from "react";

const FloorList = ({ floors, isLoading, onOpenFloor }: { floors: FloorPlan[]; isLoading: boolean; onOpenFloor: (floorId: string) => void }) => {
	if (isLoading)
		return <Skeleton className="h-16 w-full rounded-[3px]" />;

	if (floors.length === 0)
		return <p className="text-sm font-semibold text-muted-foreground">No available floors</p>;

	return (
		<div className="grid gap-2">
			{floors.map(floor => (
				<button
					key={floor.id}
					className="rounded-[3px] border-2 border-border bg-shade-1 p-3 text-left transition-transform hover:-translate-y-0.5"
					type="button"
					onClick={() => onOpenFloor(floor.id)}
				>
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-extrabold text-foreground">
							Floor
							{" "}
							{floor.floor}
						</p>
						<Badge>
							{floor.structure.rooms?.length ?? 0}
							{" "}
							rooms
						</Badge>
					</div>
				</button>
			))}
		</div>
	);
};

const BuildingsPage = () => {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();
	const buildings = useBuildings({ apiBaseUrl });
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId: selectedBuilding?.id ?? "" });
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
						Buildings
					</CardTitle>
					<CardDescription>Choose a building to view floors and book available rooms.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					{!buildings.isLoading && list.length === 0 && (
						<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
							<p className="text-sm font-extrabold text-foreground">No available buildings</p>
							<p className="text-sm font-semibold text-muted-foreground">Buildings created by owners will appear here.</p>
						</div>
					)}

					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{list.map(building => (
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
									floors
								</p>
							</button>
						))}
					</div>
				</CardContent>
			</Card>

			<Dialog open={Boolean(selectedBuilding)} onOpenChange={open => !open && setSelectedBuilding(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedBuilding?.name ?? "Building"}</DialogTitle>
						<DialogDescription>Building details for room booking.</DialogDescription>
					</DialogHeader>

					{selectedBuilding && (
						<div className="grid gap-3">
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								Name
								<Input value={selectedBuilding.name} readOnly />
							</label>
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								Address
								<Input value={selectedBuilding.address} readOnly />
							</label>
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								Floors
								<Input value={selectedBuilding.floorCount} readOnly />
							</label>
							<div className="grid gap-2">
								<p className="text-xs font-extrabold text-muted-foreground">Available floors</p>
								<FloorList floors={floorPlans.data ?? []} isLoading={floorPlans.isLoading} onOpenFloor={openFloor} />
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default BuildingsPage;
