import type { FloorLayout } from "@shared/zod-schemas";

import { Badge } from "@shared/design-system/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { Switch } from "@shared/design-system/switch";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];
type RoomScheduleDay = FloorRoom["schedule"][number];

type RoomInfoDialogProps = {
	isDifferentTimeZone: boolean;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	officeTimeZone: string;
	rooms: FloorRoom[];
	selectedRoom: FloorRoom | null;
	setSelectedRoomId: (roomId: string) => void;
	timePattern: string;
	updateSelectedRoom: (patch: Partial<FloorRoom> | ((room: FloorRoom) => FloorRoom)) => void;
	updateSelectedRoomSchedule: (day: RoomScheduleDay["day"], patch: Partial<Pick<RoomScheduleDay, "closesAt" | "dayOff" | "opensAt">>) => void;
	userTimeZone: string;
};

export function RoomInfoDialog({
	isDifferentTimeZone,
	onOpenChange,
	open,
	officeTimeZone,
	rooms,
	selectedRoom,
	setSelectedRoomId,
	timePattern,
	updateSelectedRoom,
	updateSelectedRoomSchedule,
	userTimeZone
}: RoomInfoDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{selectedRoom ? content.roomDialog.title : content.roomDialog.emptyTitle}</DialogTitle>
					<DialogDescription>
						{selectedRoom ? content.roomDialog.description : content.roomDialog.emptyDescription}
					</DialogDescription>
				</DialogHeader>

				{selectedRoom && (
					<div className="flex flex-col gap-3 overflow-y-auto">
						<div className="flex flex-wrap gap-2">
							<Badge>
								{content.roomDialog.officeTimeLabel}
								{" "}
								{officeTimeZone}
							</Badge>
							{isDifferentTimeZone && (
								<Badge>
									{content.roomDialog.userTimeLabel}
									{" "}
									{userTimeZone}
								</Badge>
							)}
						</div>

						<div className="flex items-center justify-between gap-2">
							<label className="text-xs font-extrabold text-muted-foreground" htmlFor="builder-room-select">
								{content.roomDialog.roomLabel}
							</label>
							<Badge>{rooms.length}</Badge>
						</div>
						<select
							id="builder-room-select"
							className="h-10 rounded-[2px] border-2 border-border bg-shade-0 px-3 py-2 text-sm font-bold text-foreground shadow-[inset_2px_2px_0_var(--muted)] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-border"
							value={selectedRoom.id}
							onChange={event => setSelectedRoomId(event.currentTarget.value)}
						>
							{rooms.map(room => (
								<option key={room.id} value={room.id}>
									{room.name}
								</option>
							))}
						</select>

						<div className="grid gap-2 sm:grid-cols-3">
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								{content.roomDialog.nameLabel}
								<Input value={selectedRoom.name} onChange={event => updateSelectedRoom({ name: event.currentTarget.value || content.defaultRoomNamePrefix })} />
							</label>
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								{content.roomDialog.floorLabel}
								<Input value={selectedRoom.floor} onChange={event => updateSelectedRoom({ floor: event.currentTarget.value || content.defaultRoomFloor })} />
							</label>
							<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
								{content.roomDialog.capacityLabel}
								<Input
									min={1}
									type="number"
									value={selectedRoom.capacity}
									onChange={event => updateSelectedRoom({ capacity: Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1) })}
								/>
							</label>
						</div>

						<div className="grid max-h-72 gap-2 overflow-y-auto pr-1">
							{selectedRoom.schedule.map(day => (
								<div key={day.day} className="grid grid-cols-[5.5rem_5.5rem_1fr_1fr] items-end gap-2">
									<div className="pb-2 text-xs font-extrabold text-muted-foreground capitalize">
										{day.day}
									</div>
									<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
										{content.roomDialog.dayOffLabel}
										<Switch checked={day.dayOff} onCheckedChange={checked => updateSelectedRoomSchedule(day.day, { dayOff: checked })} />
									</label>
									<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
										{content.roomDialog.opensLabel}
										<Input disabled={day.dayOff} inputMode="numeric" maxLength={5} pattern={timePattern} placeholder={content.roomDialog.opensPlaceholder} value={day.opensAt} onChange={event => updateSelectedRoomSchedule(day.day, { opensAt: event.currentTarget.value || content.roomDialog.opensPlaceholder })} />
									</label>
									<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
										{content.roomDialog.closesLabel}
										<Input disabled={day.dayOff} inputMode="numeric" maxLength={5} pattern={timePattern} placeholder={content.roomDialog.closesPlaceholder} value={day.closesAt} onChange={event => updateSelectedRoomSchedule(day.day, { closesAt: event.currentTarget.value || content.roomDialog.closesPlaceholder })} />
									</label>
								</div>
							))}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
