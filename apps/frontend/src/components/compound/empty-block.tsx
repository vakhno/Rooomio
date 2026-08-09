import type React from "react";

import { Button } from "@shared/design-system/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle
} from "@shared/design-system/empty";

interface EmptyBlockProps {
	title: string;
	description: string;
	icon?: React.ReactNode;
	buttonTitle?: string;
	buttonHandleClick?: () => void;
	linkTitle?: string;
	linkHref?: string;
}

const EmptyBlock = ({ title, description, icon, buttonTitle, buttonHandleClick, linkTitle, linkHref }: EmptyBlockProps) => {
	return (
		<Empty>
			<EmptyHeader>
				{ icon && <EmptyMedia variant="icon">{icon}</EmptyMedia> }
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				{buttonTitle && <Button variant="secondary" onClick={buttonHandleClick}>{buttonTitle}</Button>}
			</EmptyContent>
			{linkTitle && (
				<Button
					variant="link"
					asChild
					className="text-muted-foreground"
					size="sm"
				>
					<a href={linkHref}>
						{linkTitle}
					</a>
				</Button>
			)}
		</Empty>
	);
};

export default EmptyBlock;
