import type { Building, FloorPlan } from "@shared/zod-schemas";
import type { FormEvent } from "react";

import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Skeleton } from "@shared/design-system/skeleton";
import { useBuildingFloorPlans, useCreateBuilding, useGetSession, useMyBuildings } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Layers3, Mail, Plus } from "lucide-react";
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

export default function ProfilePage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const { data: session, isLoading } = useGetSession({ apiBaseUrl });
	const buildings = useMyBuildings({ apiBaseUrl });
	const createBuilding = useCreateBuilding({ apiBaseUrl });
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId: selectedBuilding?.id ?? "" });
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [form, setForm] = useState({ address: "", floorCount: 1, name: "" });

	const user = session?.user;
	const userEmail = user?.email ?? "";
	const userName = user?.name || userEmail.split("@")[0];
	const myBuildings = buildings.data ?? [];

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
		<div className="container mx-auto grid max-w-3xl gap-6 px-4 py-10 md:py-16">
			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-extrabold tracking-normal">
						Coworking record
					</CardTitle>
					<CardDescription>
						Your account details from your sign-in provider.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{isLoading
						? (
								<div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
									<Skeleton className="size-24 shrink-0 rounded-[3px]" />
									<div className="flex w-full flex-col gap-3">
										<Skeleton className="h-6 w-48" />
										<Skeleton className="h-4 w-full max-w-sm" />
										<Skeleton className="h-4 w-32" />
									</div>
								</div>
							)
						: user
							? (
									<>
										<div className="grid gap-4 sm:grid-cols-[160px_1fr]">
											<div className="grid place-items-center rounded-[3px] border-2 border-border bg-shade-1 p-4">
												<div className="grid size-24 place-items-center rounded-[3px] border-2 border-border bg-selected text-2xl font-extrabold text-foreground [box-shadow:3px_3px_0_var(--border)]">
													{userName ? userName.substring(0, 2).toUpperCase() : "??"}
												</div>
											</div>
											<div className="grid gap-3">
												<div className="rounded-[3px] border-2 border-border bg-shade-1 p-3">
													<p className="text-xs font-extrabold text-muted-foreground">NAME</p>
													<p className="truncate text-lg font-extrabold text-foreground">
														{userName}
													</p>
												</div>
												{userEmail && (
													<div className="flex min-w-0 items-center gap-3 rounded-[3px] border-2 border-border bg-shade-1 p-3">
														<Mail className="size-5 shrink-0" />
														<p className="truncate text-sm font-semibold text-muted-foreground">
															{userEmail}
														</p>
													</div>
												)}
											</div>
										</div>
										<div className="grid gap-3 rounded-[3px] border-2 border-border bg-shade-1 p-3">
											<div className="flex items-center justify-between gap-3">
												<p className="text-xs font-extrabold text-muted-foreground">MY BUILDINGS</p>
												<Button size="sm" onClick={() => setIsCreateOpen(true)}>
													<Plus className="size-4" />
													Create building
												</Button>
											</div>
											{buildings.isLoading
												? <Skeleton className="h-16 w-full rounded-[3px]" />
												: myBuildings.length > 0
													? (
															<div className="grid gap-2">
																{myBuildings.map(building => (
																	<button
																		key={building.id}
																		className="rounded-[3px] border-2 border-border bg-card p-3 text-left transition-transform hover:-translate-y-0.5"
																		type="button"
																		onClick={() => setSelectedBuilding(building)}
																	>
																		<div className="flex items-center justify-between gap-2">
																			<p className="text-sm font-extrabold text-foreground">{building.name}</p>
																			<Layers3 className="size-4 text-muted-foreground" />
																		</div>
																		<p className="truncate text-xs font-semibold text-muted-foreground">{building.address}</p>
																		<p className="mt-1 text-xs font-extrabold text-muted-foreground">
																			{building.floorCount}
																			{" "}
																			floors
																		</p>
																	</button>
																))}
															</div>
														)
													: <p className="text-sm font-semibold text-muted-foreground">No buildings created yet.</p>}
										</div>
									</>
								)
							: (
									<p className="text-sm text-muted-foreground">
										No session found. If you expected to see your profile, try signing in again.
									</p>
								)}
					<div className="flex flex-wrap gap-2 pt-2">
						<Button variant="outline" size="sm" asChild>
							<Link to="/">
								<ArrowLeft className="size-4" />
								Back to booking overview
							</Link>
						</Button>
					</div>
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
							<Button asChild>
								<Link to="/builder" search={{ buildingId: selectedBuilding.id }}>
									<Plus className="size-4" />
									Create floor
								</Link>
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
