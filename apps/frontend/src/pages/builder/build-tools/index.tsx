import { Button } from "@shared/design-system/button";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { DoorOpen, Grid2X2, SquareDashed, TableProperties } from "lucide-react";

import type { BuildTool, DoorStyle, FloorMaterial, Tool, WallMaterial } from "../builder-types";

type BuildToolsProps = {
	doorStyle: DoorStyle;
	floorMaterial: FloorMaterial;
	selectTool: (tool: BuildTool) => void;
	setDoorStyle: (style: DoorStyle) => void;
	setFloorMaterial: (material: FloorMaterial) => void;
	setWallMaterial: (material: WallMaterial) => void;
	tool: Tool;
	wallMaterial: WallMaterial;
};

export function BuildTools({
	doorStyle,
	floorMaterial,
	selectTool,
	setDoorStyle,
	setFloorMaterial,
	setWallMaterial,
	tool,
	wallMaterial
}: BuildToolsProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder.tools;

	return (
		<div className="flex max-w-[min(760px,calc(100vw-1.5rem))] flex-col gap-2">
			<div className="pointer-events-auto flex flex-wrap gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
				<Button variant={tool === "room" ? "default" : "outline"} size="sm" onClick={() => selectTool("room")}>
					<SquareDashed className="size-4" />
					{content.room}
				</Button>
				<Button variant={tool === "floor" ? "default" : "outline"} size="sm" onClick={() => selectTool("floor")}>
					<Grid2X2 className="size-4" />
					{content.floor}
				</Button>
				<Button variant={tool === "wall" ? "default" : "outline"} size="sm" onClick={() => selectTool("wall")}>
					<Grid2X2 className="size-4" />
					{content.wall}
				</Button>
				<Button variant={tool === "door" ? "default" : "outline"} size="sm" onClick={() => selectTool("door")}>
					<DoorOpen className="size-4" />
					{content.door}
				</Button>
				<Button variant={tool === "window" ? "default" : "outline"} size="sm" onClick={() => selectTool("window")}>
					<TableProperties className="size-4" />
					{content.window}
				</Button>
			</div>

			{tool === "wall" && (
				<div className="pointer-events-auto flex w-fit flex-wrap gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
					<Button variant={wallMaterial === "drywall" ? "default" : "outline"} size="sm" onClick={() => setWallMaterial("drywall")}>
						{content.drywall}
					</Button>
					<Button variant={wallMaterial === "glass" ? "default" : "outline"} size="sm" onClick={() => setWallMaterial("glass")}>
						{content.glass}
					</Button>
				</div>
			)}

			{tool === "door" && (
				<div className="pointer-events-auto flex w-fit flex-wrap gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
					<Button variant={doorStyle === "wood" ? "default" : "outline"} size="sm" onClick={() => setDoorStyle("wood")}>
						{content.wood}
					</Button>
					<Button variant={doorStyle === "glass" ? "default" : "outline"} size="sm" onClick={() => setDoorStyle("glass")}>
						{content.glass}
					</Button>
				</div>
			)}

			{tool === "floor" && (
				<div className="pointer-events-auto flex w-fit flex-wrap gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
					<Button variant={floorMaterial === "wood" ? "default" : "outline"} size="sm" onClick={() => setFloorMaterial("wood")}>
						{content.wood}
					</Button>
					<Button variant={floorMaterial === "tile" ? "default" : "outline"} size="sm" onClick={() => setFloorMaterial("tile")}>
						{content.tile}
					</Button>
					<Button variant={floorMaterial === "carpet" ? "default" : "outline"} size="sm" onClick={() => setFloorMaterial("carpet")}>
						{content.carpet}
					</Button>
				</div>
			)}
		</div>
	);
}
