import { Badge } from "@shared/design-system/badge";
import { Button } from "@shared/design-system/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@shared/design-system/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@shared/design-system/dialog";
import { Input } from "@shared/design-system/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from "@shared/design-system/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@shared/design-system/select";
import { Skeleton } from "@shared/design-system/skeleton";
import { Switch } from "@shared/design-system/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/design-system/tabs";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Building2, CalendarDays, LayoutGrid, Settings } from "lucide-react";

const meta = {
	title: "Design System/Coworking HUD",
	parameters: {
		layout: "fullscreen"
	}
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Components: Story = {
	render: () => (
		<main className="coworking-hud-story">
			<section>
				<h1>Roomioo Coworking HUD</h1>
				<p className="max-w-3xl text-muted-foreground">
					Foundational controls use hard borders, hard offset shadows, crisp selected states,
					and flat 2D HUD panels so booking workflows stay readable.
				</p>
			</section>

			<section className="coworking-hud-grid">
				<Card>
					<CardHeader>
						<CardTitle>Booking Controls</CardTitle>
						<CardDescription>Default, secondary, outline, destructive, and disabled states.</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						<Button><CalendarDays /> Book room</Button>
						<Button variant="secondary"><LayoutGrid /> View floor</Button>
						<Button variant="outline">Details</Button>
						<Button variant="destructive">Cancel</Button>
						<Button disabled>Locked</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Form Well</CardTitle>
						<CardDescription>Inputs and selects keep the pixel treatment without losing clarity.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						<Input defaultValue="Conference Hall - North Tower" aria-label="Room name" />
						<Select defaultValue="morning">
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Pick a slot" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="morning">Morning build phase</SelectItem>
								<SelectItem value="afternoon">Afternoon build phase</SelectItem>
								<SelectItem value="evening">Evening build phase</SelectItem>
							</SelectContent>
						</Select>
					</CardContent>
				</Card>
			</section>

			<section className="coworking-hud-grid">
				<Card>
					<CardHeader>
						<CardTitle>HUD Status</CardTitle>
						<CardDescription>Badges, loading blocks, and toggles share the same border language.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="flex flex-wrap gap-2">
							<Badge>Selected</Badge>
							<Badge variant="secondary">Available</Badge>
							<Badge variant="outline">Pending</Badge>
							<Badge variant="destructive">Conflict</Badge>
						</div>
						<div className="flex items-center gap-3">
							<Switch defaultChecked aria-label="Enable notifications" />
							<span className="text-sm font-bold">Notify squad</span>
						</div>
						<Skeleton className="h-10 w-full" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Overlays</CardTitle>
						<CardDescription>Dialogs and popovers remain flat panels, not isometric objects.</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline"><Settings /> Open dialog</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Room command panel</DialogTitle>
									<DialogDescription>
										Readable 2D surface, hard shadow, short motion, keyboard focus.
									</DialogDescription>
								</DialogHeader>
								<Input defaultValue="Planning room" aria-label="Dialog room name" />
							</DialogContent>
						</Dialog>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="secondary"><Bell /> Open popover</Button>
							</PopoverTrigger>
							<PopoverContent>
								<p className="text-sm font-semibold">
									Dense HUD copy wraps cleanly inside the panel without decorative effects.
								</p>
							</PopoverContent>
						</Popover>
					</CardContent>
				</Card>
			</section>

			<Card>
				<CardHeader>
					<CardTitle>Mode Selector</CardTitle>
					<CardDescription>Tabs show active state with selected yellow and hard shadow.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="rooms">
						<TabsList>
							<TabsTrigger value="rooms"><Building2 /> Rooms</TabsTrigger>
							<TabsTrigger value="floor"><LayoutGrid /> Floor</TabsTrigger>
							<TabsTrigger value="alerts"><Bell /> Alerts</TabsTrigger>
						</TabsList>
						<TabsContent value="rooms" className="pt-4">
							Room schedule controls stay in flat HUD panels.
						</TabsContent>
						<TabsContent value="floor" className="pt-4">
							Isometric assets belong here, aligned to the coworking floor grid.
						</TabsContent>
						<TabsContent value="alerts" className="pt-4">
							Alerts use the same compact panel grammar.
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter className="border-t-2 border-border pt-6">
					<Button size="sm">Apply HUD language</Button>
				</CardFooter>
			</Card>
		</main>
	)
};
