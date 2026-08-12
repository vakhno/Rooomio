import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@shared/design-system/alert-dialog";
import { Button } from "@shared/design-system/button";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Design System/Primitives/Alert Dialog",
	component: AlertDialog,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destructive: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">Cancel booking</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
					<AlertDialogDescription>
						This frees the room, table, or work spot for the rest of the coworking schedule.
						The action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep booking</AlertDialogCancel>
					<AlertDialogAction>Cancel booking</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
};
