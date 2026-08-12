import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
	"cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[2px] border-2 border-border text-sm font-extrabold transition-[background-color,color,transform,box-shadow] duration-75 outline-none [box-shadow:2px_2px_0_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:[box-shadow:0_0_0_var(--border)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:bg-disabled disabled:text-muted-foreground disabled:[box-shadow:none] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-[#e07a38]",
				destructive:
          "bg-destructive text-destructive-foreground hover:bg-[#bd4a3f]",
				outline:
          "bg-card text-card-foreground hover:bg-hover",
				secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#4c9075]",
				ghost:
          "border-transparent bg-transparent text-foreground [box-shadow:none] hover:border-border hover:bg-hover hover:[box-shadow:2px_2px_0_var(--border)]",
				link: "border-transparent bg-transparent text-primary underline-offset-4 [box-shadow:none] hover:underline"
			},
			size: {
				"default": "h-10 px-4 py-2 has-[>svg]:px-3",
				"sm": "h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
				"lg": "h-11 px-6 has-[>svg]:px-4",
				"icon": "size-10",
				"icon-sm": "size-9",
				"icon-lg": "size-11"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	}
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button">
	& VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
