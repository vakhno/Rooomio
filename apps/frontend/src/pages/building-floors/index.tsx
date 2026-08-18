import { Button } from "@shared/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/design-system/card";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useBuildingFloorPlans, useBuildings, useMyBuildings } from "@shared/queries";
import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Eye, Layers3, LayoutGrid, PencilRuler, Plus } from "lucide-react";

export default function BuildingFloorsPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.buildingFloors;
	const { buildingId = "" } = useSearch({ from: "/_home/building-floors" });
	const buildings = useBuildings({ apiBaseUrl });
	const myBuildings = useMyBuildings({ apiBaseUrl });
	const building = (buildings.data ?? []).find(item => item.id === buildingId);
	const canManageBuilding = (myBuildings.data ?? []).some(item => item.id === buildingId);
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId });
	const floors = floorPlans.data ?? [];
	const existingFloors = new Set(floors.map(floor => floor.floor));
	const nextFloor = building && canManageBuilding
		? Array.from({ length: building.floorCount }, (_, index) => index + 1).find(floor => !existingFloors.has(floor))
		: undefined;

	if (buildings.isLoading) {
		return (
			<div className="grid gap-6 px-4 py-8">
				<Skeleton className="h-40 w-full rounded-[3px]" />
			</div>
		);
	}

	if (!building) {
		return (
			<div className="grid gap-6 px-4 py-8">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl font-extrabold tracking-normal">{content.notFoundTitle}</CardTitle>
						<CardDescription>{content.notFoundDescription}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link to="/buildings">
								<ArrowLeft className="size-4" />
								{content.backAction}
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="grid gap-6 px-4 py-8">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-normal">
								<Layers3 className="size-6" />
								{building.name}
							</CardTitle>
							<CardDescription>{building.address}</CardDescription>
						</div>
						{canManageBuilding && (
							<div className="flex flex-wrap gap-2">
								{nextFloor
									? (
											<Button asChild size="sm">
												<Link to="/builder" search={{ buildingId: building.id, floor: nextFloor, mode: "new" }}>
													<Plus className="size-4" />
													{content.createFloorAction}
												</Link>
											</Button>
										)
									: (
											<Button size="sm" disabled>
												<Plus className="size-4" />
												{content.createFloorAction}
											</Button>
										)}
							</div>
						)}
					</div>
				</CardHeader>
				<CardContent className="grid gap-4">
					{floorPlans.isLoading
						? <Skeleton className="h-24 w-full rounded-[3px]" />
						: floors.length > 0
							? (
									<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
										{floors.map(floor => (
											<div key={floor.id} className="rounded-[3px] border-2 border-border bg-card p-4 text-left [box-shadow:3px_3px_0_var(--border)] transition-transform hover:-translate-y-0.5">
												<div className="flex items-center justify-between gap-3">
													<div>
														<p className="text-base font-extrabold text-foreground">
															{content.floorLabel}
															{" "}
															{floor.floor}
														</p>
														<p className="mt-1 text-sm font-semibold text-muted-foreground">{floor.name}</p>
													</div>
													<LayoutGrid className="size-5 text-muted-foreground" />
												</div>
												<p className="mt-3 text-xs font-extrabold text-muted-foreground">
													{floor.structure.rooms?.length ?? 0}
													{" "}
													{content.roomsLabel}
												</p>
												<div className="mt-4 flex flex-wrap gap-2 border-t-2 border-border pt-3">
													<Button asChild size="sm" variant="outline">
														<Link to="/floor" search={{ floorId: floor.id }}>
															<Eye className="size-4" />
															{content.openFloorAction}
														</Link>
													</Button>
													{canManageBuilding && (
														<Button asChild size="sm">
															<Link to="/builder" search={{ buildingId: building.id, floor: floor.floor, mode: undefined }}>
																<PencilRuler className="size-4" />
																{content.editFloorAction}
															</Link>
														</Button>
													)}
												</div>
											</div>
										))}
									</div>
								)
							: (
									<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
										<p className="text-sm font-extrabold text-foreground">{content.noFloorsTitle}</p>
										<p className="text-sm font-semibold text-muted-foreground">{content.noFloorsDescription}</p>
									</div>
								)}
				</CardContent>
			</Card>
		</div>
	);
}
