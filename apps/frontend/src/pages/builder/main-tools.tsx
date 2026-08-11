import { Button } from "@shared/design-system/button";
import { RotateCcw, Save, TableProperties, Undo2 } from "lucide-react";

type MainToolsProps = {
	canRedo: boolean;
	canUndo: boolean;
	canSave: boolean;
	onOpenRoomInfo: () => void;
	onOpenSave: () => void;
	onRedo: () => void;
	onReset: () => void;
	onUndo: () => void;
};

export function MainTools({ canRedo, canSave, canUndo, onOpenRoomInfo, onOpenSave, onRedo, onReset, onUndo }: MainToolsProps) {
	return (
		<div className="pointer-events-auto flex flex-wrap justify-end gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
			<Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}>
				<Undo2 className="size-4" />
			</Button>
			<Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}>
				<Undo2 className="size-4 rotate-180" />
			</Button>
			<Button variant="outline" size="sm" onClick={onReset}>
				<RotateCcw className="size-4" />
			</Button>
			<Button variant="outline" size="sm" onClick={onOpenRoomInfo}>
				<TableProperties className="size-4" />
			</Button>
			<Button size="sm" onClick={onOpenSave} disabled={!canSave}>
				<Save className="size-4" />
			</Button>
		</div>
	);
}
