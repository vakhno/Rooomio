import type { Building, FloorPlan } from "@shared/zod-schemas";

import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useBuildingFloorPlans } from "@shared/queries";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

type MyBuildingsContent = typeof DICTIONARY[typeof DEFAULT_LOCALE]["pages"]["myBuildings"];

const FloorList = ({ content, floors, isLoading }: { content: MyBuildingsContent; floors: FloorPlan[]; isLoading: boolean }) => {
	if (isLoading)
		return <Skeleton className="h-16 w-full rounded-[3px]" />;

	if (floors.length === 0)
		return <p className="text-sm font-semibold text-muted-foreground">{content.noFloors}</p>;

	return (
		<div className="grid gap-2">
			{floors.map(floor => (
				<div key={floor.id} className="rounded-[3px] border-2 border-border bg-shade-1 p-3">
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-extrabold text-foreground">
							{content.floorLabel}
							{" "}
							{floor.floor}
						</p>
						<Badge>
							{floor.structure.rooms?.length ?? 0}
							{" "}
							{content.roomsLabel}
						</Badge>
					</div>
				</div>
			))}
		</div>
	);
};

type MyBuildingDetailsDialogProps = {
	apiBaseUrl: string;
	building: Building | null;
	onOpenChange: (open: boolean) => void;
};

export function MyBuildingDetailsDialog({ apiBaseUrl, building, onOpenChange }: MyBuildingDetailsDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.myBuildings;
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId: building?.id ?? "" });
	const existingFloors = new Set((floorPlans.data ?? []).map(floor => floor.floor));
	const nextFloor = building
		? Array.from({ length: building.floorCount }, (_, index) => index + 1).find(floor => !existingFloors.has(floor))
		: undefined;

	return (
		<Dialog open={Boolean(building)} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{building?.name ?? content.buildingFallback}</DialogTitle>
					<DialogDescription>{content.detailsDialogDescription}</DialogDescription>
				</DialogHeader>

				{building && (
					<div className="grid gap-3">
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							{content.nameLabel}
							<Input value={building.name} readOnly />
						</label>
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							{content.addressLabel}
							<Input value={building.address} readOnly />
						</label>
						<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
							{content.floorsFieldLabel}
							<Input value={building.floorCount} readOnly />
						</label>
						<div className="grid gap-2">
							<p className="text-xs font-extrabold text-muted-foreground">{content.floorsFieldLabel}</p>
							<FloorList content={content} floors={floorPlans.data ?? []} isLoading={floorPlans.isLoading} />
						</div>
						{nextFloor
							? (
									<Button asChild>
										<Link to="/builder" search={{ buildingId: building.id, floor: nextFloor, mode: "new" }}>
											<Plus className="size-4" />
											{content.createFloorAction}
										</Link>
									</Button>
								)
							: (
									<Button disabled>
										<Plus className="size-4" />
										{content.createFloorAction}
									</Button>
								)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
