import type { FloorLayout } from "@shared/zod-schemas";

import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Switch } from "@shared/design-system/switch";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { Save } from "lucide-react";

type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];
type RoomScheduleDay = FloorRoom["schedule"][number];

type SaveFloorPlanDialogProps = {
	canSave: boolean;
	currentFloorPlanId?: string;
	floorNumber: number;
	floorPlanName: string;
	maxFloorNumber: number;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
	open: boolean;
	rooms: FloorRoom[];
	setFloorNumber: (floor: number) => void;
	setFloorPlanName: (name: string) => void;
	timePattern: string;
	updateRoom: (roomId: string, patch: Partial<FloorRoom> | ((room: FloorRoom) => FloorRoom)) => void;
	updateRoomSchedule: (roomId: string, day: RoomScheduleDay["day"], patch: Partial<Pick<RoomScheduleDay, "closesAt" | "dayOff" | "opensAt">>) => void;
};

export function SaveFloorPlanDialog({
	canSave,
	currentFloorPlanId,
	floorNumber,
	floorPlanName,
	maxFloorNumber,
	onOpenChange,
	onSave,
	open,
	rooms,
	setFloorNumber,
	setFloorPlanName,
	timePattern,
	updateRoom,
	updateRoomSchedule
}: SaveFloorPlanDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>{content.saveDialog.title}</DialogTitle>
					<DialogDescription>{content.saveDialog.description}</DialogDescription>
				</DialogHeader>

				<div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
					<div className="rounded-[3px] border-2 border-border bg-shade-0 p-3">
						<div className="mb-3 flex items-center justify-between gap-2">
							<div className="text-sm font-extrabold text-foreground">{content.roomDialog.floorLabel}</div>
							<Badge>{currentFloorPlanId ?? content.saveDialog.newBadge}</Badge>
						</div>

						<div className="grid gap-2 sm:grid-cols-2">
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								{content.roomDialog.nameLabel}
								<Input value={floorPlanName} onChange={event => setFloorPlanName(event.currentTarget.value)} />
							</label>
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								{content.roomDialog.floorLabel}
								<Input
									min={1}
									max={maxFloorNumber}
									type="number"
									value={floorNumber}
									onChange={event => setFloorNumber(Math.min(maxFloorNumber, Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1)))}
								/>
							</label>
						</div>
					</div>

					{rooms.length === 0 && (
						<div className="rounded-[3px] border-2 border-border bg-shade-0 p-3 text-sm font-bold text-muted-foreground">
							{content.saveDialog.noRooms}
						</div>
					)}

					{rooms.map(room => (
						<div key={room.id} className="rounded-[3px] border-2 border-border bg-shade-0 p-3">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div className="text-sm font-extrabold text-foreground">{room.name}</div>
								<Badge>{room.id}</Badge>
							</div>

							<div className="grid gap-2 sm:grid-cols-2">
								<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
									{content.roomDialog.nameLabel}
									<Input value={room.name} onChange={event => updateRoom(room.id, { name: event.currentTarget.value || content.defaultRoomNamePrefix })} />
								</label>
								<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
									{content.roomDialog.capacityLabel}
									<Input
										min={1}
										type="number"
										value={room.capacity}
										onChange={event => updateRoom(room.id, { capacity: Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1) })}
									/>
								</label>
							</div>

							<div className="mt-3 grid gap-2">
								{room.schedule.map(day => (
									<div key={day.day} className="grid grid-cols-[5.5rem_5.5rem_1fr_1fr] items-end gap-2">
										<div className="pb-2 text-xs font-extrabold text-muted-foreground capitalize">
											{day.day}
										</div>
										<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
											{content.roomDialog.dayOffLabel}
											<Switch checked={day.dayOff} onCheckedChange={checked => updateRoomSchedule(room.id, day.day, { dayOff: checked })} />
										</label>
										<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
											{content.roomDialog.opensLabel}
											<Input disabled={day.dayOff} inputMode="numeric" maxLength={5} pattern={timePattern} placeholder={content.roomDialog.opensPlaceholder} value={day.opensAt} onChange={event => updateRoomSchedule(room.id, day.day, { opensAt: event.currentTarget.value || content.roomDialog.opensPlaceholder })} />
										</label>
										<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
											{content.roomDialog.closesLabel}
											<Input disabled={day.dayOff} inputMode="numeric" maxLength={5} pattern={timePattern} placeholder={content.roomDialog.closesPlaceholder} value={day.closesAt} onChange={event => updateRoomSchedule(room.id, day.day, { closesAt: event.currentTarget.value || content.roomDialog.closesPlaceholder })} />
										</label>
									</div>
								))}
							</div>
						</div>
					))}

					<div className="flex justify-end gap-2">
						<Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
							{content.saveDialog.cancelAction}
						</Button>
						<Button size="sm" onClick={onSave} disabled={!canSave}>
							<Save className="size-4" />
							{content.saveDialog.saveAction}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
