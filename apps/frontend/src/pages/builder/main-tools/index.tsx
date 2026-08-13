import { Button } from "@shared/design-system/button";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
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
	const content = DICTIONARY[DEFAULT_LOCALE].pages.builder.controls;

	return (
		<div className="pointer-events-auto flex flex-wrap justify-end gap-2 rounded-[3px] border-2 border-border bg-card p-2 [box-shadow:3px_3px_0_var(--border)]">
			<Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo} aria-label={content.undoLabel}>
				<Undo2 className="size-4" />
			</Button>
			<Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo} aria-label={content.redoLabel}>
				<Undo2 className="size-4 rotate-180" />
			</Button>
			<Button variant="outline" size="sm" onClick={onReset} aria-label={content.resetLayoutLabel}>
				<RotateCcw className="size-4" />
			</Button>
			<Button variant="outline" size="sm" onClick={onOpenRoomInfo} aria-label={content.roomInfoLabel}>
				<TableProperties className="size-4" />
			</Button>
			<Button size="sm" onClick={onOpenSave} disabled={!canSave} aria-label={content.saveLabel}>
				<Save className="size-4" />
			</Button>
		</div>
	);
}
