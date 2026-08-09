import { Button } from "@shared/design-system/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Design System/Primitives/Dialog",
	component: Dialog,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open room panel</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Room command panel</DialogTitle>
					<DialogDescription>
						Flat HUD dialogs keep forms readable while floor-plan views can stay isometric.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-3">
					<Input defaultValue="Conference Hall - North Tower" aria-label="Room name" />
					<Input defaultValue="45 minutes" aria-label="Duration" />
				</div>
				<DialogFooter>
					<Button variant="outline">Cancel</Button>
					<Button>Save booking</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
};
