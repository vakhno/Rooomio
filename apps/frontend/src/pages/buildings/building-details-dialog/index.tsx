import type { Building, FloorPlan } from "@shared/zod-schemas";

import { Badge } from "@shared/design-system/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Skeleton } from "@shared/design-system/skeleton";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useBuildingFloorPlans } from "@shared/queries";

type BuildingsContent = typeof DICTIONARY[typeof DEFAULT_LOCALE]["pages"]["buildings"];

const FloorList = ({ content, floors, isLoading, onOpenFloor }: { content: BuildingsContent; floors: FloorPlan[]; isLoading: boolean; onOpenFloor: (floorId: string) => void }) => {
	if (isLoading)
		return <Skeleton className="h-16 w-full rounded-[3px]" />;

	if (floors.length === 0)
		return <p className="text-sm font-semibold text-muted-foreground">{content.noFloors}</p>;

	return (
		<div className="grid gap-2">
			{floors.map(floor => (
				<button
					key={floor.id}
					className="cursor-pointer rounded-[3px] border-2 border-border bg-shade-1 p-3 text-left transition-transform hover:-translate-y-0.5"
					type="button"
					onClick={() => onOpenFloor(floor.id)}
				>
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
				</button>
			))}
		</div>
	);
};

type BuildingDetailsDialogProps = {
	apiBaseUrl: string;
	building: Building | null;
	onOpenChange: (open: boolean) => void;
	onOpenFloor: (floorId: string) => void;
};

export function BuildingDetailsDialog({ apiBaseUrl, building, onOpenChange, onOpenFloor }: BuildingDetailsDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.buildings;
	const floorPlans = useBuildingFloorPlans({ apiBaseUrl, buildingId: building?.id ?? "" });

	return (
		<Dialog open={Boolean(building)} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{building?.name ?? content.buildingFallback}</DialogTitle>
					<DialogDescription>{content.dialogDescription}</DialogDescription>
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
							<p className="text-xs font-extrabold text-muted-foreground">{content.availableFloorsLabel}</p>
							<FloorList content={content} floors={floorPlans.data ?? []} isLoading={floorPlans.isLoading} onOpenFloor={onOpenFloor} />
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
