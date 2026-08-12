import * as React from "react";

import { cn } from "../../lib/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"border-border bg-shade-0 file:text-foreground placeholder:text-muted-foreground selection:bg-selected selection:text-foreground h-10 w-full min-w-0 rounded-[2px] border-2 px-3 py-2 text-base font-semibold text-foreground shadow-[inset_2px_2px_0_var(--muted)] transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted-foreground md:text-sm",
				"focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				"aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive",
				className
			)}
			{...props}
		/>
	);
}

export { Input };
