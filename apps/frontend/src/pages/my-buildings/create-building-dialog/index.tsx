import type { Building } from "@shared/zod-schemas";
import type { FormEvent } from "react";

import { Button } from "@shared/design-system/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { useCreateBuilding } from "@shared/queries";
import { Plus } from "lucide-react";
import { useState } from "react";

type CreateBuildingDialogProps = {
	apiBaseUrl: string;
	onCreated: (building: Building) => void;
	onOpenChange: (open: boolean) => void;
	open: boolean;
};

export function CreateBuildingDialog({ apiBaseUrl, onCreated, onOpenChange, open }: CreateBuildingDialogProps) {
	const content = DICTIONARY[DEFAULT_LOCALE].pages.myBuildings;
	const createBuilding = useCreateBuilding({ apiBaseUrl });
	const [form, setForm] = useState({ address: "", floorCount: 1, name: "" });

	const handleCreate = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		createBuilding.mutate(form, {
			onSuccess: (building) => {
				setForm({ address: "", floorCount: 1, name: "" });
				onOpenChange(false);
				onCreated(building);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{content.createDialog.title}</DialogTitle>
					<DialogDescription>{content.createDialog.description}</DialogDescription>
				</DialogHeader>

				<form className="grid gap-3" onSubmit={handleCreate}>
					<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
						{content.nameLabel}
						<Input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.currentTarget.value }))} required />
					</label>
					<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
						{content.addressLabel}
						<Input value={form.address} onChange={event => setForm(current => ({ ...current, address: event.currentTarget.value }))} required />
					</label>
					<label className="flex flex-col gap-1 text-xs font-extrabold text-muted-foreground">
						{content.floorsFieldLabel}
						<Input min={1} type="number" value={form.floorCount} onChange={event => setForm(current => ({ ...current, floorCount: Math.max(1, Number.parseInt(event.currentTarget.value, 10) || 1) }))} required />
					</label>
					<Button className="justify-self-end" type="submit" disabled={createBuilding.isPending}>
						<Plus className="size-4" />
						{content.createAction}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
