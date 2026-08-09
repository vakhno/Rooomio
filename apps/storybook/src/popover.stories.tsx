import { Button } from "@shared/design-system/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/design-system/popover";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell } from "lucide-react";

const meta = {
	title: "Design System/Primitives/Popover",
	component: Popover,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="secondary"><Bell /> Open popover</Button>
			</PopoverTrigger>
			<PopoverContent>
				<div className="grid gap-2">
					<p className="font-extrabold">Booking alert</p>
					<p className="text-sm font-semibold text-muted-foreground">
						Room changes use compact HUD panels with hard borders and no soft overlay effects.
					</p>
				</div>
			</PopoverContent>
		</Popover>
	)
};
