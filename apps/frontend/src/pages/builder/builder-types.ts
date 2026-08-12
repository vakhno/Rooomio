import type { FloorWall } from "@shared/zod-schemas";

export type Tool = "room" | "floor" | "wall" | "door" | "window" | "pan";
export type BuildTool = Exclude<Tool, "pan">;
export type DoorStyle = "glass" | "wood";
export type FloorMaterial = "wood" | "tile" | "carpet";
export type WallMaterial = NonNullable<FloorWall["material"]>;
