import * as React from "react";

import { cn } from "../../lib/cn";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type="checkbox"
			data-slot="checkbox"
			className={cn(
				"size-5 shrink-0 rounded-[2px] border-2 border-border bg-shade-0 accent-primary [box-shadow:2px_2px_0_var(--border)] transition-[box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-disabled disabled:opacity-70 checked:translate-x-0.5 checked:translate-y-0.5 checked:[box-shadow:0_0_0_var(--border)]",
				className
			)}
			{...props}
		/>
	);
}

export { Checkbox };
