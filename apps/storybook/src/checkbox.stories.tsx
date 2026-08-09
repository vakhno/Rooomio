import { Checkbox } from "@shared/design-system/checkbox";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Design System/Primitives/Checkbox",
	component: Checkbox,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
	render: () => (
		<div className="grid gap-4">
			<label className="flex items-center gap-3 text-sm font-extrabold">
				<Checkbox defaultChecked />
				Reserve projector
			</label>
			<label className="flex items-center gap-3 text-sm font-extrabold">
				<Checkbox />
				Notify attendees
			</label>
			<label className="flex items-center gap-3 text-sm font-extrabold text-muted-foreground">
				<Checkbox disabled />
				Locked by another booking
			</label>
			<label className="flex items-center gap-3 text-sm font-extrabold">
				<Checkbox aria-invalid />
				Invalid selection
			</label>
		</div>
	)
};
