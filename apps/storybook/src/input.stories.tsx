import { Input } from "@shared/design-system/input";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Design System/Primitives/Input",
	component: Input,
	parameters: {
		layout: "centered"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
	render: () => (
		<div className="grid w-80 gap-4">
			<label className="grid gap-2 text-sm font-extrabold">
				Room name
				<Input defaultValue="Conference Hall - North Tower" />
			</label>
			<label className="grid gap-2 text-sm font-extrabold">
				Booking email
				<Input type="email" placeholder="planner@roomioo.app" />
			</label>
			<label className="grid gap-2 text-sm font-extrabold">
				Upload floor plan
				<Input type="file" />
			</label>
		</div>
	)
};

export const States: Story = {
	render: () => (
		<div className="grid w-80 gap-4">
			<Input defaultValue="Default input" aria-label="Default input" />
			<Input placeholder="Placeholder text" aria-label="Placeholder input" />
			<Input defaultValue="Invalid booking title" aria-invalid aria-label="Invalid input" />
			<Input defaultValue="Disabled sector" disabled aria-label="Disabled input" />
		</div>
	)
};
