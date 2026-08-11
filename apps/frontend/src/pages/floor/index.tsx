import type { FloorLayout } from "@shared/zod-schemas";
import type { PointerEvent } from "react";

import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import { Skeleton } from "@shared/design-system/skeleton";
import { useFloorPlan } from "@shared/queries";
import { useSearch } from "@tanstack/react-router";
import { CircleDot, Grid2X2, Layers3, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import floorLightCarpetSrc from "@/assets/builder/floor-light-carpet.png";
import floorWhiteTileSrc from "@/assets/builder/floor-white-tile.png";
import floorWoodParquetSrc from "@/assets/builder/floor-wood-parquet.png";

type Cell = [number, number];
type Point = { x: number; y: number };
type Viewport = { height: number; width: number };
type FloorRoom = NonNullable<FloorLayout["rooms"]>[number];
type FloorMaterial = "wood" | "tile" | "carpet";
type BuilderImageKey = "floorWood" | "floorTile" | "floorCarpet";
type BuilderImages = Partial<Record<BuilderImageKey, HTMLImageElement>>;
type CanvasPalette = {
	accent: string;
	border: string;
	secondary: string;
	selected: string;
	shade0: string;
	shade1: string;
	shade2: string;
};

const TILE_W = 56;
const TILE_H = 56;
const VIEWBOX_W = 860;
const VIEWBOX_H = 560;
const FIT_PADDING = 176;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const DOOR_OPENINGS = new Set(["door", "glass-door", "wood-door"]);
const BUILDER_IMAGE_SOURCES: Record<BuilderImageKey, string> = {
	floorWood: floorWoodParquetSrc,
	floorTile: floorWhiteTileSrc,
	floorCarpet: floorLightCarpetSrc
};

const cellKey = (col: number, row: number) => `${col},${row}`;
const inBounds = (layout: FloorLayout, col: number, row: number) => col >= 0 && row >= 0 && col < layout.cols && row < layout.rows;
const gridToScreen = (col: number, row: number, originX: number, originY: number, zoom: number) => ({
	x: originX + col * TILE_W * zoom,
	y: originY + row * TILE_H * zoom
});
const screenToGrid = (x: number, y: number, originX: number, originY: number, zoom: number) => ({
	col: Math.floor((x - originX) / (TILE_W * zoom)),
	row: Math.floor((y - originY) / (TILE_H * zoom))
});
const getLayoutBounds = (layout: FloorLayout, zoom: number) => ({
	maxX: layout.cols * TILE_W * zoom,
	maxY: layout.rows * TILE_H * zoom,
	minX: 0,
	minY: 0
});
const getFitZoom = (layout: FloorLayout, viewport: Viewport = { width: VIEWBOX_W, height: VIEWBOX_H }) => {
	const { maxX, maxY, minX, minY } = getLayoutBounds(layout, 1);
	const availableWidth = Math.max(TILE_W, viewport.width - FIT_PADDING);
	const availableHeight = Math.max(TILE_H, viewport.height - FIT_PADDING);

	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(availableWidth / (maxX - minX), availableHeight / (maxY - minY))));
};
const getCenteredCamera = (layout: FloorLayout, zoom: number, viewport: Viewport = { width: VIEWBOX_W, height: VIEWBOX_H }) => {
	const bounds = getLayoutBounds(layout, zoom);

	return {
		x: viewport.width / 2 - (bounds.minX + bounds.maxX) / 2,
		y: viewport.height / 2 - (bounds.minY + bounds.maxY) / 2
	};
};
const getRoomAtCell = (layout: FloorLayout, cell: Cell) => (layout.rooms ?? []).find(room =>
	cell[0] >= room.bounds.minCol
	&& cell[0] <= room.bounds.maxCol
	&& cell[1] >= room.bounds.minRow
	&& cell[1] <= room.bounds.maxRow);
const floorImageKey = (material: FloorMaterial): BuilderImageKey => {
	if (material === "tile")
		return "floorTile";
	if (material === "carpet")
		return "floorCarpet";
	return "floorWood";
};

function resolvePalette(element: HTMLElement): CanvasPalette {
	const style = getComputedStyle(element);
	const read = (name: string) => style.getPropertyValue(name).trim();

	return {
		accent: read("--accent"),
		border: read("--border"),
		secondary: read("--secondary"),
		selected: read("--selected"),
		shade0: read("--shade-0"),
		shade1: read("--shade-1"),
		shade2: read("--shade-2")
	};
}

function drawImageCell(ctx: CanvasRenderingContext2D, image: HTMLImageElement | undefined, x: number, y: number, width: number, height: number, fallback: string) {
	if (image?.complete && image.naturalWidth > 0) {
		ctx.drawImage(image, x, y, width, height);
		return;
	}

	ctx.fillStyle = fallback;
	ctx.fillRect(x, y, width, height);
}

function drawWallLabel(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, label: string, palette: CanvasPalette) {
	ctx.fillStyle = palette.border;
	ctx.font = `800 ${Math.max(14, Math.round(Math.min(width, height) * 0.46))}px Verdana, Geneva, system-ui, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, x + width / 2, y + height / 2);
}

function drawFloorCanvas({
	camera,
	canvas,
	floorKeys,
	floorMaterials,
	hoverCell,
	images,
	layout,
	selectedRoom,
	showGrid,
	zoom
}: {
	camera: Point;
	canvas: HTMLCanvasElement;
	floorKeys: Set<string>;
	floorMaterials: Map<string, FloorMaterial>;
	hoverCell: Cell | null;
	images: BuilderImages;
	layout: FloorLayout;
	selectedRoom: FloorRoom | null;
	showGrid: boolean;
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
	ctx.clearRect(0, 0, rect.width, rect.height);
	ctx.fillStyle = palette.shade1;
	ctx.fillRect(0, 0, rect.width, rect.height);

	for (let row = 0; row < layout.rows; row++) {
		for (let col = 0; col < layout.cols; col++) {
			const key = cellKey(col, row);
			const point = gridToScreen(col, row, camera.x, camera.y, zoom);
			const cellW = TILE_W * zoom;
			const cellH = TILE_H * zoom;
			const hasFloor = floorKeys.has(key);
			const isHover = hoverCell?.[0] === col && hoverCell[1] === row;

			ctx.globalAlpha = hasFloor ? 0.92 : 0.62;
			drawImageCell(ctx, images[floorImageKey(floorMaterials.get(key) ?? "wood")], point.x, point.y, cellW, cellH, hasFloor ? palette.secondary : palette.shade0);
			ctx.globalAlpha = 1;

			if (showGrid || isHover) {
				ctx.strokeStyle = palette.border;
				ctx.lineWidth = isHover ? 3 : 1.5;
				ctx.strokeRect(point.x, point.y, cellW, cellH);
			}
		}
	}

	for (const wall of layout.walls) {
		const point = gridToScreen(wall.col, wall.row, camera.x, camera.y, zoom);
		const cellW = TILE_W * zoom;
		const cellH = TILE_H * zoom;
		const isGlass = wall.material === "glass" || wall.opening === "glass-door";

		ctx.fillStyle = isGlass ? palette.accent : wall.opening === "window" ? palette.shade0 : palette.shade2;
		ctx.globalAlpha = isGlass ? 0.34 : 1;
		ctx.fillRect(point.x, point.y, cellW, cellH);
		ctx.globalAlpha = 1;
		ctx.strokeStyle = palette.border;
		ctx.lineWidth = 1.5;
		ctx.strokeRect(point.x, point.y, cellW, cellH);

		if (DOOR_OPENINGS.has(wall.opening ?? ""))
			drawWallLabel(ctx, point.x, point.y, cellW, cellH, "D", palette);
		else if (wall.opening)
			drawWallLabel(ctx, point.x, point.y, cellW, cellH, "W", palette);
	}

	if (selectedRoom) {
		const topLeft = gridToScreen(selectedRoom.bounds.minCol, selectedRoom.bounds.minRow, camera.x, camera.y, zoom);
		const bottomRight = gridToScreen(selectedRoom.bounds.maxCol + 1, selectedRoom.bounds.maxRow + 1, camera.x, camera.y, zoom);

		ctx.strokeStyle = palette.selected;
		ctx.lineWidth = 4;
		ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
	}
}

function ReadOnlyFloorCanvas({ layout, name }: { layout: FloorLayout; name: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [zoom, setZoom] = useState(() => getFitZoom(layout));
	const [camera, setCamera] = useState(() => getCenteredCamera(layout, getFitZoom(layout)));
	const [showGrid, setShowGrid] = useState(true);
	const [hoverCell, setHoverCell] = useState<Cell | null>(null);
	const [selectedRoomId, setSelectedRoomId] = useState<string | null>(layout.rooms?.[0]?.id ?? null);
	const [panStart, setPanStart] = useState<{ camera: Point; x: number; y: number } | null>(null);
	const [images, setImages] = useState<BuilderImages>({});
	const rooms = layout.rooms ?? [];
	const selectedRoom = rooms.find(room => room.id === selectedRoomId) ?? rooms[0] ?? null;
	const hoveredRoom = hoverCell ? getRoomAtCell(layout, hoverCell) : null;
	const floorKeys = useMemo(() => new Set(layout.floor.map(([col, row]) => cellKey(col, row))), [layout.floor]);
	const floorMaterials = useMemo(() => new Map((layout.floorMaterials ?? []).map(item => [cellKey(item.col, item.row), item.material])), [layout.floorMaterials]);
	const cursorClass = panStart ? "cursor-grabbing" : hoveredRoom ? "cursor-pointer" : "cursor-grab";

	const getCanvasViewport = useCallback(() => {
		const rect = canvasRef.current?.getBoundingClientRect();

		return rect && rect.width > 0 && rect.height > 0 ? { height: rect.height, width: rect.width } : undefined;
	}, []);

	const fitView = useCallback(() => {
		const nextZoom = getFitZoom(layout, getCanvasViewport());
		setZoom(nextZoom);
		setCamera(getCenteredCamera(layout, nextZoom, getCanvasViewport()));
	}, [getCanvasViewport, layout]);

	const drawCanvas = useCallback(() => {
		const canvas = canvasRef.current;

		if (!canvas)
			return;

		drawFloorCanvas({
			camera,
			canvas,
			floorKeys,
			floorMaterials,
			hoverCell,
			images,
			layout,
			selectedRoom,
			showGrid,
			zoom
		});
	}, [camera, floorKeys, floorMaterials, hoverCell, images, layout, selectedRoom, showGrid, zoom]);

	const getCellFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const cell = screenToGrid(event.clientX - rect.left, event.clientY - rect.top, camera.x, camera.y, zoom);

		return inBounds(layout, cell.col, cell.row) ? ([cell.col, cell.row] as Cell) : null;
	};

	useEffect(() => {
		fitView();
	}, [fitView]);

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

	useEffect(() => {
		drawCanvas();
	}, [drawCanvas]);

	useEffect(() => {
		const handleResize = () => drawCanvas();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [drawCanvas]);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas)
			return;

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault();
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
		};

		canvas.addEventListener("wheel", handleWheel, { passive: false });
		return () => canvas.removeEventListener("wheel", handleWheel);
	}, [camera.x, camera.y, zoom]);

	const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		const cell = getCellFromEvent(event);
		const room = cell ? getRoomAtCell(layout, cell) : null;

		if (room) {
			setSelectedRoomId(room.id);
			return;
		}

		setPanStart({ camera, x: event.clientX, y: event.clientY });
	};

	const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
		setHoverCell(getCellFromEvent(event));

		if (panStart) {
			setCamera({
				x: panStart.camera.x + event.clientX - panStart.x,
				y: panStart.camera.y + event.clientY - panStart.y
			});
		}
	};

	const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
		if (event.currentTarget.hasPointerCapture(event.pointerId))
			event.currentTarget.releasePointerCapture(event.pointerId);

		setPanStart(null);
	};

	return (
		<div className="h-[calc(100svh-var(--header-height)-var(--header-margin-bottom)-1.5rem)] min-h-[420px] w-full px-2 pb-2">
			<div className="relative h-full overflow-hidden overscroll-contain rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:4px_4px_0_var(--border)]">
				<canvas
					ref={canvasRef}
					role="application"
					aria-label="Floor plan"
					className={`block size-full touch-none overscroll-contain ${cursorClass}`}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerCancel={() => setPanStart(null)}
					onPointerLeave={() => {
						setHoverCell(null);
						setPanStart(null);
					}}
				/>

				<div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-3">
					<div className="pointer-events-auto rounded-[3px] border-2 border-border bg-card p-3 [box-shadow:3px_3px_0_var(--border)]">
						<div className="flex items-center gap-2">
							<Layers3 className="size-5" />
							<p className="text-sm font-extrabold text-foreground">{name}</p>
							<Badge>
								{rooms.length}
								{" "}
								rooms
							</Badge>
						</div>
					</div>

					{selectedRoom && (
						<div className="pointer-events-auto min-w-64 rounded-[3px] border-2 border-border bg-card p-3 [box-shadow:3px_3px_0_var(--border)]">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-sm font-extrabold text-foreground">{selectedRoom.name}</p>
									<p className="text-xs font-semibold text-muted-foreground">{selectedRoom.floor}</p>
								</div>
								<Badge>
									{selectedRoom.capacity}
									{" "}
									places
								</Badge>
							</div>
						</div>
					)}
				</div>

				<div className="pointer-events-auto absolute right-3 bottom-3 z-10 flex flex-col gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
					<Button variant="outline" size="icon-sm" onClick={() => setShowGrid(current => !current)} aria-label="Toggle grid">
						<Grid2X2 className="size-4" />
					</Button>
					<Button variant="outline" size="icon-sm" onClick={fitView} aria-label="Reset view">
						<CircleDot className="size-4" />
					</Button>
					<div className="flex flex-col gap-1">
						<Button variant="outline" size="icon-sm" onClick={() => setZoom(current => Math.min(MAX_ZOOM, current + 0.1))} aria-label="Zoom in">
							<Plus className="size-4" />
						</Button>
						<Button variant="outline" size="icon-sm" onClick={() => setZoom(current => Math.max(MIN_ZOOM, current - 0.1))} aria-label="Zoom out">
							<Minus className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function FloorPage() {
	const apiBaseUrl = import.meta.env.VITE_API_URL;
	const { floorId = "" } = useSearch({ from: "/_home/floor" });
	const floorPlan = useFloorPlan({ apiBaseUrl, floorId });
	const floor = floorPlan.data;

	if (floorPlan.isLoading)
		return <Skeleton className="h-[calc(100svh-var(--header-height)-var(--header-margin-bottom)-1.5rem)] min-h-[420px] w-full rounded-[3px]" />;

	if (!floor) {
		return (
			<div className="px-4 py-8">
				<div className="rounded-[3px] border-2 border-border bg-shade-1 p-4">
					<p className="text-sm font-extrabold text-foreground">Floor not found</p>
					<p className="text-sm font-semibold text-muted-foreground">Choose another floor from buildings.</p>
				</div>
			</div>
		);
	}

	return <ReadOnlyFloorCanvas layout={floor.structure} name={floor.name} />;
}
