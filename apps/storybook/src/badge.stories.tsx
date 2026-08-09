import { Badge } from "@shared/design-system/badge";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Check, Clock, MapPin } from "lucide-react";

const meta = {
	title: "Design System/Primitives/Badge",
	component: Badge,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
	render: () => (
		<div className="grid gap-4">
			<div className="flex flex-wrap gap-2">
				<Badge><Check /> Selected</Badge>
				<Badge variant="secondary"><MapPin /> Available</Badge>
				<Badge variant="outline"><Clock /> Pending</Badge>
				<Badge variant="destructive"><AlertTriangle /> Conflict</Badge>
			</div>
			<div className="flex flex-wrap gap-2">
				<Badge>Compact</Badge>
				<Badge variant="secondary">Focus room</Badge>
				<Badge variant="outline">Long coworking resource label wraps outside only if parent allows</Badge>
			</div>
		</div>
	)
};

export const States: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Badge tabIndex={0}>Focusable</Badge>
			<Badge aria-invalid>Invalid</Badge>
			<Badge className="opacity-60">Disabled context</Badge>
		</div>
	)
};
