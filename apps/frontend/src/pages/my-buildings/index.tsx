import type { Building, FloorPlan } from "@shared/zod-schemas";
import type { FormEvent } from "react";

import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Skeleton } from "@shared/design-system/skeleton";
import { useBuildingFloorPlans, useCreateBuilding, useMyBuildings } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { Building2, Layers3, Plus } from "lucide-react";
import { useState } from "react";

const FloorList = ({ floors, isLoading }: { floors: FloorPlan[]; isLoading: boolean }) => {
	if (isLoading)
		return <Skeleton className="h-16 w-full rounded-[3px]" />;

	if (floors.length === 0)
		return <p className="text-sm font-semibold text-muted-foreground">No available floors</p>;

	return (
		<div className="grid gap-2">
			{floors.map(floor => (
				<div key={floor.id} className="rounded-[3px] border-2 border-border bg-shade-1 p-3">
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
				</div>
			))}
		</div>
	);
};

export default function MyBuildingsPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const buildings = useMyBuildings({ apiBaseUrl });
	const createBuilding = useCreateBuilding({ apiBaseUrl });
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId: selectedBuilding?.id ?? "" });
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [form, setForm] = useState({ address: "", floorCount: 1, name: "" });
	const myBuildings = buildings.data ?? [];
	const existingFloors = new Set((floorPlans.data ?? []).map(floor => floor.floor));
	const nextFloor = selectedBuilding
		? Array.from({ length: selectedBuilding.floorCount }, (_, index) => index + 1).find(floor => !existingFloors.has(floor))
		: undefined;

	const handleCreate = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		createBuilding.mutate(form, {
			onSuccess: (building) => {
				setForm({ address: "", floorCount: 1, name: "" });
				setIsCreateOpen(false);
				setSelectedBuilding(building);
			}
		});
	};

	return (
		<div className="grid gap-6 px-4 py-8">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-normal">
								<Building2 className="size-6" />
								My buildings
							</CardTitle>
							<CardDescription>Manage your buildings and create floors.</CardDescription>
						</div>
						<Button size="sm" onClick={() => setIsCreateOpen(true)}>
							<Plus className="size-4" />
							Create building
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
													floors
												</p>
											</button>
										))}
									</div>
								)
							: (
									<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
										<p className="text-sm font-extrabold text-foreground">No buildings created yet.</p>
										<p className="text-sm font-semibold text-muted-foreground">Create a building before adding floors.</p>
									</div>
								)}
				</CardContent>
			</Card>

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create building</DialogTitle>
						<DialogDescription>Add building details before creating floors.</DialogDescription>
					</DialogHeader>

					<form className="grid gap-3" onSubmit={handleCreate}>
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							Name
							<Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.currentTarget.value }))} required />
						</label>
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							Address
							<Input value={form.address} onChange={event => setForm(current => ({ ...current, address: event.currentTarget.value }))} required />
						</label>
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							Floors
							<Input min={1} type="number" value={form.floorCount} onChange={event => setForm(current => ({ ...current, floorCount: Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1) }))} required />
						</label>
						<Button className="justify-self-end" type="submit" disabled={createBuilding.isPending}>
							<Plus className="size-4" />
							Create
						</Button>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(selectedBuilding)} onOpenChange={open => !open && setSelectedBuilding(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedBuilding?.name ?? "Building"}</DialogTitle>
						<DialogDescription>Building details and floor setup.</DialogDescription>
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
								<p className="text-xs font-extrabold text-muted-foreground">Floors</p>
								<FloorList floors={floorPlans.data ?? []} isLoading={floorPlans.isLoading} />
							</div>
							{nextFloor
								? (
										<Button asChild>
											<Link to="/builder" search={{ buildingId: selectedBuilding.id, floor: nextFloor, mode: "new" }}>
												<Plus className="size-4" />
												Create floor
											</Link>
										</Button>
									)
								: (
										<Button disabled>
											<Plus className="size-4" />
											Create floor
										</Button>
									)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
