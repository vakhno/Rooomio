import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/cn";

const badgeVariants = cva(
	"inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[2px] border border-border px-2 py-1 text-xs font-extrabold whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg:not([class*='size-'])]:size-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive",
	{
		variants: {
			variant: {
				default:
          "bg-primary text-primary-foreground [a&]:hover:bg-[#e07a38]",
				secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-[#4c9075]",
				destructive:
          "bg-destructive text-destructive-foreground [a&]:hover:bg-[#bd4a3f]",
				outline:
          "bg-card text-foreground [a&]:hover:bg-hover"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	}
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span">
	& VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
