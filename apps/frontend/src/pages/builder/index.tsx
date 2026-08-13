import type { FloorLayout, FloorWall } from "@shared/zod-schemas";
import type { PointerEvent } from "react";

import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useCurrentFloorPlan, useMyBuildings, useSaveCurrentFloorPlan } from "@shared/queries";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import floorLightCarpetSrc from "@/assets/builder/floor-light-carpet.png";
import floorWhiteTileSrc from "@/assets/builder/floor-white-tile.png";
import floorWoodParquetSrc from "@/assets/builder/floor-wood-parquet.png";
import { useUserTimeZone } from "@/hooks/use-user-time-zone";

import type { DoorStyle, FloorMaterial, Tool, WallMaterial } from "./builder-types";

import { BuildTools } from "./build-tools";
import { BuilderScene } from "./builder-scene";
import { MainTools } from "./main-tools";
import { RoomInfoDialog } from "./room-info-dialog";
import { SaveFloorPlanDialog } from "./save-floor-plan-dialog";
import { SecondaryTools } from "./secondary-tools";

type Cell = [number, number];
type Opening = NonNullable<FloorWall["opening"]>;
type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];
type RoomScheduleDay = FloorRoom["schedule"][number];
type RoomBounds = FloorRoom["bounds"];
type ResizeHandle = "tl" | "tr" | "bl" | "br";
type RoomDrag = {
	handle?: ResizeHandle;
	id: string;
	layout: FloorLayout;
	startBounds: RoomBounds;
	startCell: Cell;
};
type Point = { x: number; y: number };
type Viewport = { height: number; width: number };
type CanvasPalette = {
	border: string;
	accent: string;
	destructive: string;
	secondary: string;
	selected: string;
	shade0: string;
	shade1: string;
	shade2: string;
};
type BuilderImageKey = "floorWood" | "floorTile" | "floorCarpet";
type BuilderImages = Partial<Record<BuilderImageKey, HTMLImageElement>>;

const DEFAULT_LAYOUT: FloorLayout = {
	cols: 34,
	rows: 34,
	floor: [],
	floorMaterials: [],
	rooms: [],
	walls: []
};

const TILE_W = 56;
const TILE_H = 56;
const MIN_ROOM_SIDE = 3;
const MIN_GRID = 3;
const MAX_GRID = 100;
const VIEWBOX_W = 860;
const VIEWBOX_H = 560;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const FIT_PADDING = 176;
const DOOR_OPENINGS = new Set<Opening>(["door", "glass-door", "wood-door"]);
const OFFICE_TIME_ZONE = "Europe/Kyiv";
const WEEKDAYS: Array<RoomScheduleDay["day"]> = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TIME_PATTERN = "[0-2][0-9]:[0-5][0-9]";
const BUILDER_IMAGE_SOURCES: Record<BuilderImageKey, string> = {
	floorWood: floorWoodParquetSrc,
	floorTile: floorWhiteTileSrc,
	floorCarpet: floorLightCarpetSrc
};

const cellKey = (col: number, row: number) => `${col},${row}`;
const fromKey = (key: string): Cell => key.split(",").map(Number) as Cell;
const inBounds = (layout: FloorLayout, col: number, row: number) => col >= 0 && row >= 0 && col < layout.cols && row < layout.rows;
const createRoomId = () => globalThis.crypto?.randomUUID?.() ?? `room-${Date.now()}`;
const isWeekend = (day: RoomScheduleDay["day"]) => day === "saturday" || day === "sunday";
const defaultRoomSchedule = () => WEEKDAYS.map(day => ({ day, dayOff: isWeekend(day), opensAt: "09:00", closesAt: "19:00" }));
const normalizeRoomSchedule = (schedule: FloorRoom["schedule"] | { closesAt?: string; dayOff?: boolean; opensAt?: string } | undefined): FloorRoom["schedule"] => {
	if (Array.isArray(schedule)) {
		const byDay = new Map(schedule.map(day => [day.day, day]));
		return WEEKDAYS.map((day) => {
			const existing = byDay.get(day);
			return existing ? { ...existing, dayOff: existing.dayOff ?? isWeekend(day) } : { day, dayOff: isWeekend(day), opensAt: "09:00", closesAt: "19:00" };
		});
	}

	return WEEKDAYS.map(day => ({
		day,
		dayOff: schedule?.dayOff ?? isWeekend(day),
		opensAt: schedule?.opensAt ?? "09:00",
		closesAt: schedule?.closesAt ?? "19:00"
	}));
};

const toSets = (layout: FloorLayout) => ({
	floor: new Set(layout.floor.map(([col, row]) => cellKey(col, row))),
	walls: new Map(layout.walls.map(wall => [cellKey(wall.col, wall.row), wall]))
});

const normalizeLayout = (layout: FloorLayout): FloorLayout => {
	const floor = [...new Set(layout.floor.filter(([col, row]) => inBounds(layout, col, row)).map(([col, row]) => cellKey(col, row)))]
		.map(fromKey);
	const walls = [...new Map(layout.walls.filter(wall => inBounds(layout, wall.col, wall.row)).map(wall => [cellKey(wall.col, wall.row), wall])).values()];
	const floorMaterials = [...new Map((layout.floorMaterials ?? [])
		.filter(({ col, row }) => inBounds(layout, col, row))
		.map(materialCell => [cellKey(materialCell.col, materialCell.row), materialCell])).values()];
	const rooms = [...new Map((layout.rooms ?? [])
		.filter(room => inBounds(layout, room.bounds.minCol, room.bounds.minRow) && inBounds(layout, room.bounds.maxCol, room.bounds.maxRow))
		.map(room => [room.id, { ...room, schedule: normalizeRoomSchedule(room.schedule) }])).values()];

	return { ...layout, floor, floorMaterials, rooms, walls };
};

const gridToScreen = (col: number, row: number, originX: number, originY: number, zoom: number) => ({
	x: originX + col * TILE_W * zoom,
	y: originY + row * TILE_H * zoom
});

const getLayoutBounds = (layout: FloorLayout, zoom: number) => {
	const points = [
		gridToScreen(0, 0, 0, 0, zoom),
		gridToScreen(layout.cols, 0, 0, 0, zoom),
		gridToScreen(layout.cols, layout.rows, 0, 0, zoom),
		gridToScreen(0, layout.rows, 0, 0, zoom)
	];
	const minX = Math.min(...points.map(point => point.x));
	const maxX = Math.max(...points.map(point => point.x));
	const minY = Math.min(...points.map(point => point.y));
	const maxY = Math.max(...points.map(point => point.y));

	return { maxX, maxY, minX, minY };
};

const getFitZoom = (layout: FloorLayout, viewport: Viewport = { width: VIEWBOX_W, height: VIEWBOX_H }) => {
	const { maxX, maxY, minX, minY } = getLayoutBounds(layout, 1);
	const availableWidth = Math.max(TILE_W, viewport.width - FIT_PADDING);
	const availableHeight = Math.max(TILE_H, viewport.height - FIT_PADDING);
	const width = maxX - minX;
	const height = maxY - minY;

	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(availableWidth / width, availableHeight / height)));
};

const getCenteredCamera = (layout: FloorLayout, zoom: number, viewport: Viewport = { width: VIEWBOX_W, height: VIEWBOX_H }) => {
	const { maxX, maxY, minX, minY } = getLayoutBounds(layout, zoom);

	return {
		x: viewport.width / 2 - (minX + maxX) / 2,
		y: viewport.height / 2 - (minY + maxY) / 2
	};
};

const screenToGrid = (x: number, y: number, originX: number, originY: number, zoom: number) => {
	const sx = (x - originX) / zoom;
	const sy = (y - originY) / zoom;
	const col = Math.floor(sx / TILE_W);
	const row = Math.floor(sy / TILE_H);

	return { col, row };
};

const roomBounds = (start: Cell, end: Cell) => {
	const minCol = Math.min(start[0], end[0]);
	const maxCol = Math.max(start[0], end[0]);
	const minRow = Math.min(start[1], end[1]);
	const maxRow = Math.max(start[1], end[1]);

	return { minCol, maxCol, minRow, maxRow, width: maxCol - minCol + 1, height: maxRow - minRow + 1 };
};

function canBuildRoom(layout: FloorLayout, start: Cell, end: Cell) {
	const bounds = roomBounds(start, end);

	if (bounds.width < MIN_ROOM_SIDE || bounds.height < MIN_ROOM_SIDE)
		return false;

	const { floor, walls } = toSets(layout);
	for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
		for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
			if (!inBounds(layout, col, row) || floor.has(cellKey(col, row)) || walls.has(cellKey(col, row)))
				return false;
		}
	}

	return true;
}

function getRoomAtCell(layout: FloorLayout, cell: Cell) {
	return (layout.rooms ?? []).find(room =>
		cell[0] >= room.bounds.minCol
		&& cell[0] <= room.bounds.maxCol
		&& cell[1] >= room.bounds.minRow
		&& cell[1] <= room.bounds.maxRow);
}

function boundsSize(bounds: RoomBounds) {
	return {
		height: bounds.maxRow - bounds.minRow + 1,
		width: bounds.maxCol - bounds.minCol + 1
	};
}

function isCellInBounds(cell: Cell, bounds: RoomBounds) {
	return cell[0] >= bounds.minCol && cell[0] <= bounds.maxCol && cell[1] >= bounds.minRow && cell[1] <= bounds.maxRow;
}

function getRoomHandlePositions(bounds: RoomBounds) {
	return {
		tl: [bounds.minCol, bounds.minRow] as Cell,
		tr: [bounds.maxCol + 1, bounds.minRow] as Cell,
		bl: [bounds.minCol, bounds.maxRow + 1] as Cell,
		br: [bounds.maxCol + 1, bounds.maxRow + 1] as Cell
	};
}

function canPlaceRoomBounds(layout: FloorLayout, roomId: string, bounds: RoomBounds) {
	const size = boundsSize(bounds);
	const room = (layout.rooms ?? []).find(item => item.id === roomId);

	if (!room || size.width < MIN_ROOM_SIDE || size.height < MIN_ROOM_SIDE)
		return false;

	for (const otherRoom of layout.rooms ?? []) {
		const separated = bounds.maxCol < otherRoom.bounds.minCol
			|| bounds.minCol > otherRoom.bounds.maxCol
			|| bounds.maxRow < otherRoom.bounds.minRow
			|| bounds.minRow > otherRoom.bounds.maxRow;

		if (otherRoom.id !== roomId && !separated)
			return false;
	}

	const { floor, walls } = toSets(layout);
	for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
		for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
			if (!inBounds(layout, col, row))
				return false;

			if (!isCellInBounds([col, row], room.bounds) && (floor.has(cellKey(col, row)) || walls.has(cellKey(col, row))))
				return false;
		}
	}

	return true;
}

function setRoomBounds(layout: FloorLayout, roomId: string, bounds: RoomBounds) {
	if (!canPlaceRoomBounds(layout, roomId, bounds))
		return layout;

	const room = (layout.rooms ?? []).find(item => item.id === roomId);

	if (!room)
		return layout;

	const { floor, walls } = toSets(layout);
	const floorMaterials = new Map((layout.floorMaterials ?? []).map(item => [cellKey(item.col, item.row), item]));
	const roomFloorMaterials = new Map<string, FloorMaterial>();
	const roomWalls = new Map<string, { wall: FloorWall; wasBorder: boolean }>();

	for (let col = room.bounds.minCol; col <= room.bounds.maxCol; col++) {
		for (let row = room.bounds.minRow; row <= room.bounds.maxRow; row++) {
			const key = cellKey(col, row);
			const relativeKey = cellKey(col - room.bounds.minCol, row - room.bounds.minRow);
			const wasBorder = col === room.bounds.minCol || col === room.bounds.maxCol || row === room.bounds.minRow || row === room.bounds.maxRow;
			const material = floorMaterials.get(key)?.material;
			const wall = walls.get(key);

			if (material)
				roomFloorMaterials.set(relativeKey, material);
			if (wall)
				roomWalls.set(relativeKey, { wall, wasBorder });

			floor.delete(key);
			walls.delete(key);
			floorMaterials.delete(key);
		}
	}

	for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
		for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
			const key = cellKey(col, row);
			const relativeKey = cellKey(col - bounds.minCol, row - bounds.minRow);
			const border = col === bounds.minCol || col === bounds.maxCol || row === bounds.minRow || row === bounds.maxRow;
			const movedWall = roomWalls.get(relativeKey);
			const preservedWall = movedWall && (!movedWall.wasBorder || border) ? movedWall.wall : undefined;

			if (preservedWall || border) {
				floor.delete(key);
				walls.set(key, {
					...(preservedWall ?? {
						direction: row === bounds.minRow || row === bounds.maxRow ? "v" : "h",
						material: "drywall",
						opening: null
					}),
					col,
					row
				});
			}
			else {
				walls.delete(key);
				floor.add(key);
				floorMaterials.set(key, {
					col,
					row,
					material: roomFloorMaterials.get(relativeKey) ?? "wood"
				});
			}
		}
	}

	return normalizeLayout({
		...layout,
		floor: [...floor].map(fromKey),
		floorMaterials: [...floorMaterials.values()],
		rooms: (layout.rooms ?? []).map(item => item.id === roomId ? { ...item, bounds } : item),
		walls: [...walls.values()]
	});
}

function cellPoints(col: number, row: number, originX: number, originY: number, zoom: number) {
	const topLeft = gridToScreen(col, row, originX, originY, zoom);
	const topRight = gridToScreen(col + 1, row, originX, originY, zoom);
	const bottomRight = gridToScreen(col + 1, row + 1, originX, originY, zoom);
	const bottomLeft = gridToScreen(col, row + 1, originX, originY, zoom);

	return [topLeft, topRight, bottomRight, bottomLeft];
}

function wallCellFaces(col: number, row: number, originX: number, originY: number, zoom: number) {
	return {
		left: [] as Point[],
		right: [] as Point[],
		top: cellPoints(col, row, originX, originY, zoom)
	};
}

function resolvePalette(element: HTMLElement): CanvasPalette {
	const style = getComputedStyle(element);
	const read = (name: string) => style.getPropertyValue(name).trim();

	return {
		border: read("--border"),
		accent: read("--accent"),
		destructive: read("--destructive"),
		secondary: read("--secondary"),
		selected: read("--selected"),
		shade0: read("--shade-0"),
		shade1: read("--shade-1"),
		shade2: read("--shade-2")
	};
}

function tracePolygon(ctx: CanvasRenderingContext2D, points: Point[]) {
	ctx.beginPath();
	ctx.moveTo(points[0]?.x ?? 0, points[0]?.y ?? 0);
	for (const point of points.slice(1))
		ctx.lineTo(point.x, point.y);
	ctx.closePath();
}

function drawPolygon(ctx: CanvasRenderingContext2D, points: Point[], fill: string, stroke: string, strokeWidth: number, opacity = 1) {
	ctx.save();
	ctx.globalAlpha = opacity;
	tracePolygon(ctx, points);
	ctx.fillStyle = fill;
	ctx.fill();
	ctx.strokeStyle = stroke;
	ctx.lineWidth = strokeWidth;
	ctx.stroke();
	ctx.restore();
}

function drawTexturedPolygon(ctx: CanvasRenderingContext2D, points: Point[], image: HTMLImageElement | undefined, fallback: string) {
	if (!image?.complete || image.naturalWidth === 0) {
		drawPolygon(ctx, points, fallback, "transparent", 0);
		return;
	}

	const minX = Math.min(...points.map(point => point.x));
	const maxX = Math.max(...points.map(point => point.x));
	const minY = Math.min(...points.map(point => point.y));
	const maxY = Math.max(...points.map(point => point.y));

	ctx.save();
	tracePolygon(ctx, points);
	ctx.clip();
	ctx.drawImage(image, minX, minY, maxX - minX, maxY - minY);
	ctx.restore();
}

function drawGlassWall(ctx: CanvasRenderingContext2D, topLeft: Point, width: number, height: number, palette: CanvasPalette, stroke: string, strokeWidth: number) {
	ctx.save();
	ctx.fillStyle = palette.accent;
	ctx.globalAlpha = 0.34;
	ctx.fillRect(topLeft.x, topLeft.y, width, height);
	ctx.restore();

	ctx.strokeStyle = stroke;
	ctx.lineWidth = strokeWidth;
	ctx.strokeRect(topLeft.x, topLeft.y, width, height);
}

function drawWallLabel(ctx: CanvasRenderingContext2D, topLeft: Point, width: number, height: number, label: string, palette: CanvasPalette) {
	ctx.save();
	ctx.fillStyle = palette.border;
	ctx.font = `800 ${Math.max(14, Math.round(Math.min(width, height) * 0.46))}px Verdana, Geneva, system-ui, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, topLeft.x + width / 2, topLeft.y + height / 2);
	ctx.restore();
}

function floorImageKey(material: FloorMaterial): BuilderImageKey {
	if (material === "tile")
		return "floorTile";
	if (material === "carpet")
		return "floorCarpet";
	return "floorWood";
}

const getResizeHandlePositions = (layout: FloorLayout) => ({
	tl: [0, 0] as Cell,
	tr: [layout.cols, 0] as Cell,
	bl: [0, layout.rows] as Cell,
	br: [layout.cols, layout.rows] as Cell
});

function drawBuilderCanvas({
	canvas,
	camera,
	cells,
	floorKeys,
	floorMaterials,
	hoverCell,
	images,
	isRoomPreviewValid,
	layout,
	previewKeys,
	showGrid,
	sortedWalls,
	tool,
	zoom
}: {
	canvas: HTMLCanvasElement;
	camera: Point;
	cells: Cell[];
	floorKeys: Set<string>;
	floorMaterials: Map<string, FloorMaterial>;
	hoverCell: Cell | null;
	images: BuilderImages;
	isRoomPreviewValid: boolean;
	layout: FloorLayout;
	previewKeys: Set<string>;
	showGrid: boolean;
	sortedWalls: FloorWall[];
	tool: Tool;
	zoom: number;
}) {
	const ctx = canvas.getContext("2d");

	if (!ctx)
		return;

	const pixelRatio = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();
	const width = Math.round(rect.width * pixelRatio);
	const height = Math.round(rect.height * pixelRatio);

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}

	ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

	const palette = resolvePalette(canvas);
	const originX = camera.x;
	const originY = camera.y;

	ctx.clearRect(0, 0, rect.width, rect.height);
	ctx.fillStyle = palette.shade1;
	ctx.fillRect(0, 0, rect.width, rect.height);

	for (const [col, row] of cells) {
		const key = cellKey(col, row);
		const hasFloor = floorKeys.has(key);
		const isHover = hoverCell?.[0] === col && hoverCell[1] === row;
		const isPreview = previewKeys.has(key);
		const opacity = isPreview ? 0.78 : hasFloor ? 0.9 : 0.68;
		const points = cellPoints(col, row, originX, originY, zoom);

		if (!isPreview) {
			ctx.save();
			ctx.globalAlpha = opacity;
			drawTexturedPolygon(ctx, points, images[floorImageKey(floorMaterials.get(key) ?? "wood")], palette.secondary);
			ctx.restore();
			drawPolygon(ctx, points, "transparent", showGrid || isHover ? palette.border : "transparent", isHover ? 3 : 1.5);
			continue;
		}

		drawPolygon(
			ctx,
			points,
			isPreview ? (isRoomPreviewValid ? palette.secondary : palette.destructive) : hasFloor ? palette.secondary : palette.shade0,
			palette.border,
			isHover ? 3 : 1.5,
			opacity
		);
	}

	for (const wall of sortedWalls) {
		const topLeft = gridToScreen(wall.col, wall.row, originX, originY, zoom);
		const points = cellPoints(wall.col, wall.row, originX, originY, zoom);
		const cellW = TILE_W * zoom;
		const cellH = TILE_H * zoom;
		const isHover = hoverCell?.[0] === wall.col && hoverCell[1] === wall.row;
		const wallStroke = isHover && (tool === "door" || tool === "window") ? palette.selected : palette.border;
		const wallStrokeWidth = isHover && (tool === "door" || tool === "window") ? 3 : 1.5;

		if (DOOR_OPENINGS.has(wall.opening as Opening)) {
			if (wall.opening === "glass-door")
				drawGlassWall(ctx, topLeft, cellW, cellH, palette, wallStroke, wallStrokeWidth);
			else
				drawPolygon(ctx, points, palette.selected, wallStroke, wallStrokeWidth);
			drawWallLabel(ctx, topLeft, cellW, cellH, "D", palette);
			continue;
		}

		if (wall.opening) {
			drawPolygon(ctx, points, palette.shade0, wallStroke, wallStrokeWidth);
			drawWallLabel(ctx, topLeft, cellW, cellH, "W", palette);
			continue;
		}

		if (wall.material === "glass") {
			drawGlassWall(ctx, topLeft, cellW, cellH, palette, wallStroke, wallStrokeWidth);
			continue;
		}

		drawPolygon(ctx, points, palette.shade2, wallStroke, wallStrokeWidth);
	}

	const hoveredRoom = hoverCell ? getRoomAtCell(layout, hoverCell) : null;
	if (hoveredRoom) {
		const topLeft = gridToScreen(hoveredRoom.bounds.minCol, hoveredRoom.bounds.minRow, originX, originY, zoom);
		const bottomRight = gridToScreen(hoveredRoom.bounds.maxCol + 1, hoveredRoom.bounds.maxRow + 1, originX, originY, zoom);

		ctx.strokeStyle = palette.selected;
		ctx.lineWidth = 3;
		ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);

		for (const [, [col, row]] of Object.entries(getRoomHandlePositions(hoveredRoom.bounds)) as Array<[ResizeHandle, Cell]>) {
			const point = gridToScreen(col, row, originX, originY, zoom);
			ctx.beginPath();
			ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
			ctx.fillStyle = palette.selected;
			ctx.fill();
			ctx.strokeStyle = palette.border;
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}

	if (hoverCell && !hoveredRoom) {
		for (const [, [col, row]] of Object.entries(getResizeHandlePositions(layout)) as Array<[ResizeHandle, Cell]>) {
			const point = gridToScreen(col, row, originX, originY, zoom);
			ctx.beginPath();
			ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
			ctx.fillStyle = palette.selected;
			ctx.fill();
			ctx.strokeStyle = palette.border;
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}
}

function pointInPolygon(point: Point, polygon: Point[]) {
	let inside = false;

	for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
		const currentPoint = polygon[index];
		const previousPoint = polygon[previous];
		const intersects = (currentPoint.y > point.y) !== (previousPoint.y > point.y)
			&& point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x;

		if (intersects)
			inside = !inside;
	}

	return inside;
}

function buildRoom(layout: FloorLayout, start: Cell, end: Cell, roomId: string, roomName: string, roomFloor: string) {
	const bounds = roomBounds(start, end);

	if (!canBuildRoom(layout, start, end))
		return layout;

	const { floor, walls } = toSets(layout);
	for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
		for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
			const key = cellKey(col, row);
			const border = col === bounds.minCol || col === bounds.maxCol || row === bounds.minRow || row === bounds.maxRow;

			if (border) {
				floor.delete(key);
				walls.set(key, {
					col,
					row,
					direction: row === bounds.minRow || row === bounds.maxRow ? "v" : "h",
					material: "drywall",
					opening: null
				});
			}
			else {
				walls.delete(key);
				floor.add(key);
			}
		}
	}

	return normalizeLayout({
		...layout,
		floor: [...floor].map(fromKey),
		rooms: [
			...(layout.rooms ?? []),
			{
				id: roomId,
				name: roomName,
				floor: roomFloor,
				capacity: 4,
				schedule: defaultRoomSchedule(),
				bounds: {
					maxCol: bounds.maxCol,
					maxRow: bounds.maxRow,
					minCol: bounds.minCol,
					minRow: bounds.minRow
				}
			}
		],
		walls: [...walls.values()]
	});
}

function toggleWall(layout: FloorLayout, col: number, row: number, material: WallMaterial) {
	if (!inBounds(layout, col, row))
		return layout;

	const { floor, walls } = toSets(layout);
	const key = cellKey(col, row);

	floor.delete(key);
	if (walls.has(key)) {
		walls.delete(key);
	}
	else {
		walls.set(key, { col, row, direction: "v", material, opening: null });
	}

	return normalizeLayout({ ...layout, floor: [...floor].map(fromKey), walls: [...walls.values()] });
}

function toggleOpening(layout: FloorLayout, col: number, row: number, opening: Opening) {
	const { floor, walls } = toSets(layout);
	const key = cellKey(col, row);
	const wall = walls.get(key);

	if (!wall)
		return layout;

	walls.set(key, { ...wall, opening: wall.opening === opening ? null : opening });
	floor.delete(key);

	return normalizeLayout({ ...layout, floor: [...floor].map(fromKey), walls: [...walls.values()] });
}

function paintFloorMaterial(layout: FloorLayout, col: number, row: number, material: FloorMaterial) {
	if (!inBounds(layout, col, row))
		return layout;

	const key = cellKey(col, row);
	const floorMaterials = new Map((layout.floorMaterials ?? []).map(item => [cellKey(item.col, item.row), item]));

	floorMaterials.set(key, { col, row, material });

	return normalizeLayout({ ...layout, floorMaterials: [...floorMaterials.values()] });
}

function reindexLayout(layout: FloorLayout, cols: number, rows: number, shiftCol: number, shiftRow: number) {
	return normalizeLayout({
		cols,
		rows,
		floor: layout.floor.map(([col, row]) => [col - shiftCol, row - shiftRow]),
		floorMaterials: (layout.floorMaterials ?? []).map(item => ({ ...item, col: item.col - shiftCol, row: item.row - shiftRow })),
		rooms: (layout.rooms ?? []).map(room => ({
			...room,
			bounds: {
				maxCol: room.bounds.maxCol - shiftCol,
				maxRow: room.bounds.maxRow - shiftRow,
				minCol: room.bounds.minCol - shiftCol,
				minRow: room.bounds.minRow - shiftRow
			}
		})),
		walls: layout.walls.map(wall => ({ ...wall, col: wall.col - shiftCol, row: wall.row - shiftRow }))
	});
}

function canResizeFloorWithoutCroppingRooms(layout: FloorLayout, cols: number, rows: number, shiftCol: number, shiftRow: number) {
	return (layout.rooms ?? []).every((room) => {
		const minCol = room.bounds.minCol - shiftCol;
		const maxCol = room.bounds.maxCol - shiftCol;
		const minRow = room.bounds.minRow - shiftRow;
		const maxRow = room.bounds.maxRow - shiftRow;

		return minCol >= 0 && minRow >= 0 && maxCol < cols && maxRow < rows;
	});
}

export default function BuilderPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder;
	const navigate = useNavigate();
	const { buildingId = "", floor: requestedFloor, mode } = useSearch({ from: "/_home/builder" });
	const isNewFloor = mode === "new";
	const currentFloorPlan = useCurrentFloorPlan({ apiBaseUrl, buildingId });
	const buildings = useMyBuildings({ apiBaseUrl });
	const saveFloorPlan = useSaveCurrentFloorPlan({ apiBaseUrl, buildingId });
	const userTimeZone = useUserTimeZone();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [layout, setLayout] = useState<FloorLayout>(DEFAULT_LAYOUT);
	const [tool, setTool] = useState<Tool>("pan");
	const [doorStyle, setDoorStyle] = useState<DoorStyle>("wood");
	const [floorMaterial, setFloorMaterial] = useState<FloorMaterial>("wood");
	const [wallMaterial, setWallMaterial] = useState<WallMaterial>("drywall");
	const [zoom, setZoom] = useState(() => getFitZoom(DEFAULT_LAYOUT));
	const [camera, setCamera] = useState(() => getCenteredCamera(DEFAULT_LAYOUT, getFitZoom(DEFAULT_LAYOUT)));
	const [showGrid, setShowGrid] = useState(true);
	const [history, setHistory] = useState<FloorLayout[]>([]);
	const [redoStack, setRedoStack] = useState<FloorLayout[]>([]);
	const [dragStart, setDragStart] = useState<Cell | null>(null);
	const [dragEnd, setDragEnd] = useState<Cell | null>(null);
	const [hoverCell, setHoverCell] = useState<Cell | null>(null);
	const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
	const [paintedCells, setPaintedCells] = useState<Set<string>>(() => new Set());
	const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
	const [isRoomPanelOpen, setIsRoomPanelOpen] = useState(false);
	const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
	const [floorPlanName, setFloorPlanName] = useState<string>(content.defaultFloorName);
	const [floorNumber, setFloorNumber] = useState(1);
	const [roomDrag, setRoomDrag] = useState<RoomDrag | null>(null);
	const [panStart, setPanStart] = useState<{ camera: { x: number; y: number }; x: number; y: number } | null>(null);
	const [resizeDrag, setResizeDrag] = useState<{
		anchor: { x: number; y: number };
		camera: { x: number; y: number };
		handle: ResizeHandle;
		layout: FloorLayout;
	} | null>(null);
	const [images, setImages] = useState<BuilderImages>({});
	const hasCenteredInitialViewRef = useRef(false);
	const zoomRef = useRef(zoom);
	const selectedBuilding = buildings.data?.find(building => building.id === buildingId);
	const maxFloorNumber = selectedBuilding?.floorCount ?? 1;

	const applyLayout = (next: FloorLayout | ((current: FloorLayout) => FloorLayout)) => {
		setLayout((current) => {
			const resolved = typeof next === "function" ? next(current) : next;

			if (JSON.stringify(resolved) === JSON.stringify(current))
				return current;

			setHistory(items => [...items.slice(-24), current]);
			setRedoStack([]);
			return resolved;
		});
	};

	useEffect(() => {
		zoomRef.current = zoom;
	}, [zoom]);

	const getCanvasViewport = useCallback(() => {
		const rect = canvasRef.current?.getBoundingClientRect();

		return rect && rect.width > 0 && rect.height > 0
			? { width: rect.width, height: rect.height }
			: undefined;
	}, []);

	const fitView = useCallback((nextLayout: FloorLayout) => {
		const nextZoom = getFitZoom(nextLayout, getCanvasViewport());

		setZoom(nextZoom);
		setCamera(getCenteredCamera(nextLayout, nextZoom, getCanvasViewport()));
	}, [getCanvasViewport]);

	useEffect(() => {
		if (isNewFloor) {
			const nextFloor = Math.min(maxFloorNumber, Math.max(1, requestedFloor ?? 1));

			setLayout(DEFAULT_LAYOUT);
			setFloorPlanName(content.defaultFloorName);
			setFloorNumber(nextFloor);
			fitView(DEFAULT_LAYOUT);
			hasCenteredInitialViewRef.current = true;
			return;
		}

		if (currentFloorPlan.data?.structure) {
			setLayout(currentFloorPlan.data.structure);
			setFloorPlanName(currentFloorPlan.data.name);
			setFloorNumber(currentFloorPlan.data.floor);
			fitView(currentFloorPlan.data.structure);
			hasCenteredInitialViewRef.current = true;
		}
	}, [content.defaultFloorName, currentFloorPlan.data, fitView, isNewFloor, maxFloorNumber, requestedFloor]);

	useEffect(() => {
		if (selectedBuilding)
			setFloorNumber(current => Math.min(selectedBuilding.floorCount, Math.max(1, current)));
	}, [selectedBuilding]);

	useEffect(() => {
		if (hasCenteredInitialViewRef.current || !canvasRef.current)
			return;

		fitView(layout);
		hasCenteredInitialViewRef.current = true;
	}, [fitView, layout]);

	useEffect(() => {
		let cancelled = false;
		const loadedImages: BuilderImages = {};

		for (const [key, source] of Object.entries(BUILDER_IMAGE_SOURCES) as Array<[BuilderImageKey, string]>) {
			const image = new Image();
			image.onload = () => {
				if (cancelled)
					return;

				loadedImages[key] = image;
				setImages({ ...loadedImages });
			};
			image.src = source;
		}

		return () => {
			cancelled = true;
		};
	}, []);

	const originX = camera.x;
	const originY = camera.y;
	const previewBounds = dragStart && dragEnd ? roomBounds(dragStart, dragEnd) : null;
	const isRoomPreviewValid = dragStart && dragEnd ? canBuildRoom(layout, dragStart, dragEnd) : false;
	const previewKeys = useMemo(() => {
		if (!previewBounds)
			return new Set<string>();

		const keys = new Set<string>();
		for (let col = previewBounds.minCol; col <= previewBounds.maxCol; col++) {
			for (let row = previewBounds.minRow; row <= previewBounds.maxRow; row++) {
				keys.add(cellKey(col, row));
			}
		}
		return keys;
	}, [previewBounds]);
	const cells = useMemo(() => {
		const result: Cell[] = [];
		for (let row = 0; row < layout.rows; row++) {
			for (let col = 0; col < layout.cols; col++) {
				result.push([col, row]);
			}
		}
		return result.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[0] - b[0]);
	}, [layout.cols, layout.rows]);

	const floorKeys = useMemo(() => new Set(layout.floor.map(([col, row]) => cellKey(col, row))), [layout.floor]);
	const floorMaterials = useMemo(() => new Map((layout.floorMaterials ?? []).map(item => [cellKey(item.col, item.row), item.material])), [layout.floorMaterials]);
	const rooms = layout.rooms ?? [];
	const selectedRoom = rooms.find(room => room.id === selectedRoomId) ?? rooms[0] ?? null;
	const isDifferentTimeZone = userTimeZone !== OFFICE_TIME_ZONE;
	const hoveredRoom = hoverCell ? getRoomAtCell(layout, hoverCell) : null;
	const handleRoom = hoveredRoom;
	const isHoveringRoom = Boolean(hoveredRoom);
	const isHoveringResizeHandle = Boolean(hoverPoint && (hitSelectedRoomHandleAtPoint(hoverPoint) || (!isHoveringRoom && hitResizeHandleAtPoint(hoverPoint))));
	const sortedWalls = useMemo(() => [...layout.walls].sort((a, b) => (a.col + a.row) - (b.col + b.row) || a.col - b.col), [layout.walls]);
	let cursorClass = "cursor-crosshair";
	if (panStart || roomDrag)
		cursorClass = "cursor-grabbing";
	else if (isHoveringResizeHandle)
		cursorClass = "cursor-nesw-resize";
	else if (tool === "pan" || (tool === "room" && isHoveringRoom))
		cursorClass = "cursor-grab";

	const drawCanvas = useCallback(() => {
		const canvas = canvasRef.current;

		if (!canvas)
			return;

		drawBuilderCanvas({
			canvas,
			camera,
			cells,
			floorKeys,
			floorMaterials,
			hoverCell,
			images,
			isRoomPreviewValid,
			layout,
			previewKeys,
			showGrid,
			sortedWalls,
			tool,
			zoom
		});
	}, [camera, cells, floorKeys, floorMaterials, hoverCell, images, isRoomPreviewValid, layout, previewKeys, showGrid, sortedWalls, tool, zoom]);

	useEffect(() => {
		drawCanvas();
	}, [drawCanvas]);

	useEffect(() => {
		const handleResize = () => drawCanvas();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [drawCanvas]);

	const getCellFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const cell = screenToGrid(x, y, originX, originY, zoom);

		return inBounds(layout, cell.col, cell.row) ? ([cell.col, cell.row] as Cell) : null;
	};

	const getPointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();

		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	};

	function hitResizeHandleAtPoint(point: Point) {
		const handles = getResizeHandlePositions(layout);

		return (Object.entries(handles) as Array<[ResizeHandle, Cell]>).find(([, [col, row]]) => {
			const screen = gridToScreen(col, row, originX, originY, zoom);
			return Math.hypot(screen.x - point.x, screen.y - point.y) <= 16;
		})?.[0] ?? null;
	}

	function hitSelectedRoomHandleAtPoint(point: Point) {
		if (!handleRoom)
			return null;

		const handles = getRoomHandlePositions(handleRoom.bounds);

		return (Object.entries(handles) as Array<[ResizeHandle, Cell]>).find(([, [col, row]]) => {
			const screen = gridToScreen(col, row, originX, originY, zoom);
			return Math.hypot(screen.x - point.x, screen.y - point.y) <= 14;
		})?.[0] ?? null;
	}

	const getWallFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointFromEvent(event);

		for (const wall of [...sortedWalls].reverse()) {
			const faces = wallCellFaces(wall.col, wall.row, originX, originY, zoom);

			if (pointInPolygon(point, faces.top) || pointInPolygon(point, faces.left) || pointInPolygon(point, faces.right))
				return [wall.col, wall.row] as Cell;
		}

		return null;
	};

	const hitResizeHandle = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointFromEvent(event);

		return hitResizeHandleAtPoint(point);
	};

	const getGridLineFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointFromEvent(event);
		const sx = (point.x - originX) / zoom;
		const sy = (point.y - originY) / zoom;

		return {
			col: Math.round(sx / TILE_W),
			row: Math.round(sy / TILE_H)
		};
	};

	const hitSelectedRoomHandle = (event: PointerEvent<HTMLCanvasElement>) => {
		const point = getPointFromEvent(event);

		return hitSelectedRoomHandleAtPoint(point);
	};

	const roomBoundsFromResize = (drag: RoomDrag, event: PointerEvent<HTMLCanvasElement>): RoomBounds => {
		const gridLine = getGridLineFromEvent(event);
		let { maxCol, maxRow, minCol, minRow } = drag.startBounds;

		if (drag.handle === "tl" || drag.handle === "bl")
			minCol = Math.min(maxCol - MIN_ROOM_SIDE + 1, Math.max(0, gridLine.col));
		if (drag.handle === "tr" || drag.handle === "br")
			maxCol = Math.max(minCol + MIN_ROOM_SIDE - 1, Math.min(layout.cols - 1, gridLine.col - 1));
		if (drag.handle === "tl" || drag.handle === "tr")
			minRow = Math.min(maxRow - MIN_ROOM_SIDE + 1, Math.max(0, gridLine.row));
		if (drag.handle === "bl" || drag.handle === "br")
			maxRow = Math.max(minRow + MIN_ROOM_SIDE - 1, Math.min(layout.rows - 1, gridLine.row - 1));

		return { maxCol, maxRow, minCol, minRow };
	};

	const roomBoundsFromMove = (drag: RoomDrag, event: PointerEvent<HTMLCanvasElement>): RoomBounds => {
		const cell = getCellFromEvent(event);
		const size = boundsSize(drag.startBounds);

		if (!cell)
			return drag.startBounds;

		const deltaCol = cell[0] - drag.startCell[0];
		const deltaRow = cell[1] - drag.startCell[1];
		const minCol = Math.min(layout.cols - size.width, Math.max(0, drag.startBounds.minCol + deltaCol));
		const minRow = Math.min(layout.rows - size.height, Math.max(0, drag.startBounds.minRow + deltaRow));

		return {
			maxCol: minCol + size.width - 1,
			maxRow: minRow + size.height - 1,
			minCol,
			minRow
		};
	};

	const resizeFromEvent = (event: PointerEvent<HTMLCanvasElement>, drag = resizeDrag) => {
		if (!drag)
			return;

		const point = getPointFromEvent(event);
		const cell = screenToGrid(point.x, point.y, drag.camera.x, drag.camera.y, zoom);
		const start = drag.layout;
		let cols = start.cols;
		let rows = start.rows;
		let shiftCol = 0;
		let shiftRow = 0;

		if (drag.handle === "br" || drag.handle === "tr") {
			cols = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.round(cell.col)));
		}
		else {
			cols = Math.min(MAX_GRID, Math.max(MIN_GRID, start.cols - Math.round(cell.col)));
			shiftCol = start.cols - cols;
		}

		if (drag.handle === "br" || drag.handle === "bl") {
			rows = Math.min(MAX_GRID, Math.max(MIN_GRID, Math.round(cell.row)));
		}
		else {
			rows = Math.min(MAX_GRID, Math.max(MIN_GRID, start.rows - Math.round(cell.row)));
			shiftRow = start.rows - rows;
		}

		if (!canResizeFloorWithoutCroppingRooms(start, cols, rows, shiftCol, shiftRow))
			return;

		const nextLayout = reindexLayout(start, cols, rows, shiftCol, shiftRow);
		setLayout(nextLayout);
		const anchorCell = getResizeHandlePositions(nextLayout)[drag.handle === "br" ? "tl" : drag.handle === "tr" ? "bl" : drag.handle === "bl" ? "tr" : "br"];
		const anchorScreen = gridToScreen(anchorCell[0], anchorCell[1], 0, 0, zoom);
		setCamera({ x: drag.anchor.x - anchorScreen.x, y: drag.anchor.y - anchorScreen.y });
	};

	const commitCell = (cell: Cell) => {
		if (tool === "floor")
			applyLayout(current => paintFloorMaterial(current, cell[0], cell[1], floorMaterial));
		if (tool === "wall")
			applyLayout(current => toggleWall(current, cell[0], cell[1], wallMaterial));
		if (tool === "door")
			applyLayout(current => toggleOpening(current, cell[0], cell[1], `${doorStyle}-door`));
		if (tool === "window")
			applyLayout(current => toggleOpening(current, cell[0], cell[1], "window"));
	};

	const updateRoom = (roomId: string, patch: Partial<FloorRoom> | ((room: FloorRoom) => FloorRoom)) => {
		setLayout(current => normalizeLayout({
			...current,
			rooms: (current.rooms ?? []).map((room) => {
				if (room.id !== roomId)
					return room;

				return typeof patch === "function" ? patch(room) : { ...room, ...patch };
			})
		}));
	};

	const updateSelectedRoom = (patch: Partial<FloorRoom> | ((room: FloorRoom) => FloorRoom)) => {
		if (selectedRoom)
			updateRoom(selectedRoom.id, patch);
	};

	const updateRoomSchedule = (roomId: string, day: RoomScheduleDay["day"], patch: Partial<Pick<RoomScheduleDay, "closesAt" | "dayOff" | "opensAt">>) => {
		updateRoom(roomId, room => ({
			...room,
			schedule: normalizeRoomSchedule(room.schedule).map(item => item.day === day ? { ...item, ...patch } : item)
		}));
	};

	const updateSelectedRoomSchedule = (day: RoomScheduleDay["day"], patch: Partial<Pick<RoomScheduleDay, "closesAt" | "dayOff" | "opensAt">>) => {
		if (selectedRoom)
			updateRoomSchedule(selectedRoom.id, day, patch);
	};

	const selectTool = (nextTool: Exclude<Tool, "pan">) => setTool(current => current === nextTool ? "pan" : nextTool);

	const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);

		const selectedRoomHandle = hitSelectedRoomHandle(event);
		if (handleRoom && selectedRoomHandle) {
			const cell = getCellFromEvent(event);
			setSelectedRoomId(handleRoom.id);
			setHistory(items => [...items.slice(-24), layout]);
			setRedoStack([]);
			setRoomDrag({
				handle: selectedRoomHandle,
				id: handleRoom.id,
				layout,
				startBounds: handleRoom.bounds,
				startCell: cell ?? [handleRoom.bounds.minCol, handleRoom.bounds.minRow]
			});
			return;
		}

		const floorHandle = hoveredRoom ? null : hitResizeHandle(event);
		if (floorHandle) {
			const anchorHandle = floorHandle === "br" ? "tl" : floorHandle === "tr" ? "bl" : floorHandle === "bl" ? "tr" : "br";
			const [anchorCol, anchorRow] = getResizeHandlePositions(layout)[anchorHandle];
			const anchor = gridToScreen(anchorCol, anchorRow, originX, originY, zoom);
			setHistory(items => [...items.slice(-24), layout]);
			setRedoStack([]);
			setResizeDrag({ anchor, camera, handle: floorHandle, layout });
			return;
		}

		if (event.shiftKey) {
			setPanStart({ x: event.clientX, y: event.clientY, camera });
			return;
		}

		const cell = getWallFromEvent(event) ?? getCellFromEvent(event);
		if (!cell) {
			if (tool === "pan")
				setPanStart({ x: event.clientX, y: event.clientY, camera });
			return;
		}

		const room = getRoomAtCell(layout, cell);
		if (room) {
			setSelectedRoomId(room.id);

			if (tool === "pan" || tool === "room") {
				setHistory(items => [...items.slice(-24), layout]);
				setRedoStack([]);
				setRoomDrag({
					handle: room.id === selectedRoomId ? hitSelectedRoomHandle(event) ?? undefined : undefined,
					id: room.id,
					layout,
					startBounds: room.bounds,
					startCell: cell
				});
				return;
			}
		}

		if (tool === "pan") {
			setPanStart({ x: event.clientX, y: event.clientY, camera });
			return;
		}

		if (tool === "room") {
			setDragStart(cell);
			setDragEnd(cell);
			return;
		}

		commitCell(cell);
		setPaintedCells(new Set([cellKey(cell[0], cell[1])]));
	};

	const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
		const currentCell = getWallFromEvent(event) ?? getCellFromEvent(event);
		setHoverCell(currentCell);
		setHoverPoint(getPointFromEvent(event));

		if (roomDrag) {
			const nextBounds = roomDrag.handle ? roomBoundsFromResize(roomDrag, event) : roomBoundsFromMove(roomDrag, event);
			setLayout(setRoomBounds(roomDrag.layout, roomDrag.id, nextBounds));
			return;
		}

		if (resizeDrag) {
			resizeFromEvent(event);
			return;
		}

		if (panStart) {
			setCamera({
				x: panStart.camera.x + event.clientX - panStart.x,
				y: panStart.camera.y + event.clientY - panStart.y
			});
			return;
		}

		if (!dragStart) {
			const cell = currentCell;
			if (cell && paintedCells.size > 0) {
				const key = cellKey(cell[0], cell[1]);
				if (!paintedCells.has(key)) {
					commitCell(cell);
					setPaintedCells(current => new Set([...current, key]));
				}
			}
			return;
		}

		const cell = currentCell;
		if (cell)
			setDragEnd(cell);
	};

	const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);

		if (dragStart && dragEnd && canBuildRoom(layout, dragStart, dragEnd)) {
			const roomId = createRoomId();
			applyLayout(current => buildRoom(
				current,
				dragStart,
				dragEnd,
				roomId,
				`${content.defaultRoomNamePrefix} ${(current.rooms ?? []).length + 1}`,
				content.defaultRoomFloor
			));
			setSelectedRoomId(roomId);
			setIsRoomPanelOpen(true);
		}

		setDragStart(null);
		setDragEnd(null);
		setPaintedCells(new Set());
		setRoomDrag(null);
		setPanStart(null);
		setResizeDrag(null);
	};

	const handlePointerCancel = () => {
		setDragStart(null);
		setDragEnd(null);
		setPaintedCells(new Set());
		setHoverPoint(null);
		setRoomDrag(null);
		setPanStart(null);
		setResizeDrag(null);
	};

	const handleCanvasWheel = useCallback((event: WheelEvent) => {
		event.preventDefault();
		event.stopPropagation();

		const canvas = canvasRef.current;

		if (!canvas)
			return;

		const rect = canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
		const worldX = (mouseX - camera.x) / zoom;
		const worldY = (mouseY - camera.y) / zoom;

		setZoom(nextZoom);
		setCamera({
			x: mouseX - worldX * nextZoom,
			y: mouseY - worldY * nextZoom
		});
	}, [camera.x, camera.y, zoom]);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas)
			return;

		canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
		return () => canvas.removeEventListener("wheel", handleCanvasWheel);
	}, [handleCanvasWheel]);

	const undo = () => {
		const previous = history[history.length - 1];
		if (!previous)
			return;

		setRedoStack(items => [layout, ...items]);
		setHistory(items => items.slice(0, -1));
		setLayout(previous);
	};

	const redo = () => {
		const next = redoStack[0];
		if (!next)
			return;

		setHistory(items => [...items, layout]);
		setRedoStack(items => items.slice(1));
		setLayout(next);
	};

	const resetView = () => {
		fitView(layout);
	};

	const resetLayout = () => {
		applyLayout(DEFAULT_LAYOUT);
		fitView(DEFAULT_LAYOUT);
	};

	const saveReviewedFloorPlan = () => {
		const nextFloorNumber = Math.min(maxFloorNumber, Math.max(1, floorNumber));
		saveFloorPlan.mutate({
			floor: nextFloorNumber,
			name: floorPlanName || content.defaultFloorName,
			structure: {
				...layout,
				rooms: rooms.map(room => ({ ...room, floor: String(nextFloorNumber) }))
			}
		}, {
			onSuccess: floor => void navigate({ to: "/floor", search: { floorId: floor.id } })
		});
	};

	return (
		<div className="h-[calc(100svh-var(--header-height)-var(--header-margin-bottom)-1.5rem)] min-h-[420px] w-full px-2 pb-2">
			<BuilderScene
				canvasRef={canvasRef}
				cursorClass={cursorClass}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerCancel}
				onPointerCancel={handlePointerCancel}
			>
				<div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3">
					<BuildTools
						doorStyle={doorStyle}
						floorMaterial={floorMaterial}
						selectTool={selectTool}
						setDoorStyle={setDoorStyle}
						setFloorMaterial={setFloorMaterial}
						setWallMaterial={setWallMaterial}
						tool={tool}
						wallMaterial={wallMaterial}
					/>

					<MainTools
						canRedo={redoStack.length > 0}
						canSave={Boolean(buildingId) && !saveFloorPlan.isPending}
						canUndo={history.length > 0}
						onOpenRoomInfo={() => setIsRoomPanelOpen(true)}
						onOpenSave={() => setIsSavePanelOpen(true)}
						onRedo={redo}
						onReset={resetLayout}
						onUndo={undo}
					/>
				</div>

				<RoomInfoDialog
					isDifferentTimeZone={isDifferentTimeZone}
					onOpenChange={setIsRoomPanelOpen}
					open={isRoomPanelOpen}
					officeTimeZone={OFFICE_TIME_ZONE}
					rooms={rooms}
					selectedRoom={selectedRoom ? { ...selectedRoom, schedule: normalizeRoomSchedule(selectedRoom.schedule) } : null}
					setSelectedRoomId={setSelectedRoomId}
					timePattern={TIME_PATTERN}
					updateSelectedRoom={updateSelectedRoom}
					updateSelectedRoomSchedule={updateSelectedRoomSchedule}
					userTimeZone={userTimeZone}
				/>
				<SaveFloorPlanDialog
					canSave={Boolean(buildingId) && !saveFloorPlan.isPending}
					currentFloorPlanId={currentFloorPlan.data?.id}
					floorNumber={floorNumber}
					floorPlanName={floorPlanName}
					maxFloorNumber={maxFloorNumber}
					onOpenChange={setIsSavePanelOpen}
					onSave={saveReviewedFloorPlan}
					open={isSavePanelOpen}
					rooms={rooms.map(room => ({ ...room, schedule: normalizeRoomSchedule(room.schedule) }))}
					setFloorNumber={setFloorNumber}
					setFloorPlanName={setFloorPlanName}
					timePattern={TIME_PATTERN}
					updateRoom={updateRoom}
					updateRoomSchedule={updateRoomSchedule}
				/>

				<SecondaryTools
					onResetView={resetView}
					onToggleGrid={() => setShowGrid(current => !current)}
					onZoomIn={() => setZoom(current => Math.min(MAX_ZOOM, current + 0.1))}
					onZoomOut={() => setZoom(current => Math.max(MIN_ZOOM, current - 0.1))}
				/>
			</BuilderScene>
		</div>
	);
}
