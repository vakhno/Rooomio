import { Button } from "@shared/design-system/button";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { CircleDot, Grid2X2, Minus, Plus, Square } from "lucide-react";

type SecondaryToolsProps = {
	onResetView: () => void;
	onToggleGrid: () => void;
	onZoomIn: () => void;
	onZoomOut: () => void;
};

export function SecondaryTools({ onResetView, onToggleGrid, onZoomIn, onZoomOut }: SecondaryToolsProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder.controls;

	return (
		<div className="pointer-events-auto absolute right-3 bottom-3 z-10 flex flex-col items-center gap-1">
			<div className="flex items-center gap-1 rounded-[2px] border border-border bg-card px-1.5 py-1 text-[10px] font-extrabold leading-none text-muted-foreground">
				<Square className="size-3" />
				{content.scaleLabel}
			</div>
			<div className="flex flex-col gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
				<Button variant="outline" size="icon-sm" onClick={onToggleGrid} aria-label={content.toggleGridLabel}>
					<Grid2X2 className="size-4" />
				</Button>
				<Button variant="outline" size="icon-sm" onClick={onResetView} aria-label={content.resetViewLabel}>
					<CircleDot className="size-4" />
				</Button>
				<div className="flex flex-col gap-1">
					<Button variant="outline" size="icon-sm" onClick={onZoomIn} aria-label={content.zoomInLabel}>
						<Plus className="size-4" />
					</Button>
					<Button variant="outline" size="icon-sm" onClick={onZoomOut} aria-label={content.zoomOutLabel}>
						<Minus className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
