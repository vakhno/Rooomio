import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "../../lib/cn";

function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted focus-visible:ring-ring inline-flex h-6 w-10 shrink-0 items-center rounded-[2px] border-2 border-border transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					"bg-shade-0 pointer-events-none block size-4 rounded-[1px] border border-border ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
				)}
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
