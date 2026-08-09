import { Switch } from "@shared/design-system/switch";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Design System/Primitives/Switch",
	component: Switch,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
	render: () => (
		<div className="grid gap-4">
			<label className="flex items-center gap-3 text-sm font-extrabold">
				<Switch defaultChecked aria-label="Notify attendees" />
				Notify attendees
			</label>
			<label className="flex items-center gap-3 text-sm font-extrabold">
				<Switch aria-label="Auto approve" />
				Auto approve
			</label>
			<label className="flex items-center gap-3 text-sm font-extrabold text-muted-foreground">
				<Switch disabled aria-label="Disabled sync" />
				Disabled sync
			</label>
		</div>
	)
};
