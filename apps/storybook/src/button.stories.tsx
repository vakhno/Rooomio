import { Button } from "@shared/design-system/button";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarDays, LayoutGrid, Settings, Trash2 } from "lucide-react";

const meta = {
	title: "Design System/Primitives/Button",
	component: Button,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
	render: () => (
		<div className="grid gap-4">
			<div className="flex flex-wrap gap-3">
				<Button><CalendarDays /> Book room</Button>
				<Button variant="secondary"><LayoutGrid /> View floor</Button>
				<Button variant="outline">Details</Button>
				<Button variant="ghost"><Settings /> Ghost</Button>
				<Button variant="destructive"><Trash2 /> Cancel</Button>
				<Button variant="link">Text link</Button>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<Button size="sm">Small</Button>
				<Button>Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon" aria-label="Open settings"><Settings /></Button>
			</div>
		</div>
	)
};

export const States: Story = {
	render: () => (
		<div className="grid gap-4">
			<div className="flex flex-wrap gap-3">
				<Button>Default</Button>
				<Button className="translate-x-0.5 translate-y-0.5 [box-shadow:0_0_0_var(--border)]">
					Pressed
				</Button>
				<Button disabled>Disabled</Button>
				<Button aria-invalid>Invalid</Button>
			</div>
			<Button className="max-w-72 whitespace-normal text-left">
				Long booking action label wraps without breaking the HUD button frame
			</Button>
		</div>
	)
};
