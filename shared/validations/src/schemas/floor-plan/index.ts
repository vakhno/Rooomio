import { z } from "zod";

const CellSchema = z.tuple([z.number().int().min(0), z.number().int().min(0)]);
const FloorMaterialSchema = z.enum(["wood", "tile", "carpet"]);
const WallMaterialSchema = z.enum(["drywall", "glass"]);
const WeekdaySchema = z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const isWeekend = (day: (typeof WEEKDAYS)[number]) => day === "saturday" || day === "sunday";

const FloorMaterialCellSchema = z.object({
	col: z.number().int().min(0),
	row: z.number().int().min(0),
	material: FloorMaterialSchema
});

const RoomBoundsSchema = z.object({
	minCol: z.number().int().min(0),
	maxCol: z.number().int().min(0),
	minRow: z.number().int().min(0),
	maxRow: z.number().int().min(0)
});

const RoomScheduleDaySchema = z.object({
	day: WeekdaySchema,
	dayOff: z.boolean().default(false),
	opensAt: z.string().regex(/^\d{2}:\d{2}$/),
	closesAt: z.string().regex(/^\d{2}:\d{2}$/)
});

const RoomScheduleSchema = z.preprocess((value) => {
	if (value && typeof value === "object" && !Array.isArray(value) && "opensAt" in value && "closesAt" in value) {
		const source = value as { closesAt?: unknown; opensAt?: unknown };
		return WEEKDAYS.map(day => ({
			day,
			dayOff: isWeekend(day),
			opensAt: typeof source.opensAt === "string" ? source.opensAt : "09:00",
			closesAt: typeof source.closesAt === "string" ? source.closesAt : "19:00"
		}));
	}

	return value;
}, z.array(RoomScheduleDaySchema).min(7).max(7));

const FloorRoomSchema = z.object({
	id: z.string().trim().min(1),
	name: z.string().trim().min(1).max(80),
	floor: z.string().trim().min(1).max(80),
	capacity: z.number().int().min(1).max(1000),
	schedule: RoomScheduleSchema,
	bounds: RoomBoundsSchema
});

export const FloorWallSchema = z.object({
	col: z.number().int().min(0),
	row: z.number().int().min(0),
	direction: z.enum(["v", "h"]),
	material: WallMaterialSchema.optional().default("drywall"),
	opening: z.enum(["door", "glass-door", "wood-door", "window"]).nullable()
});

export const FloorLayoutSchema = z.object({
	cols: z.number().int().min(3).max(100),
	rows: z.number().int().min(3).max(100),
	floor: z.array(CellSchema).max(10000),
	floorMaterials: z.array(FloorMaterialCellSchema).max(10000).optional().default([]),
	rooms: z.array(FloorRoomSchema).max(1000).optional().default([]),
	walls: z.array(FloorWallSchema).max(10000)
});

export const SaveFloorPlanSchema = z.object({
	buildingId: z.string().trim().min(1),
	floor: z.number().int().min(1).max(200).default(1),
	name: z.string().trim().min(1).max(80).default("Floor"),
	structure: FloorLayoutSchema
});

export type FloorLayout = z.infer<typeof FloorLayoutSchema>;
export type FloorWall = z.infer<typeof FloorWallSchema>;
export type SaveFloorPlanInput = z.infer<typeof SaveFloorPlanSchema>;

export type FloorPlan = SaveFloorPlanInput & {
	id: string;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
};
