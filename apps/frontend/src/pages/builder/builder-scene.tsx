import type { PointerEvent, ReactNode, RefObject } from "react";

type BuilderSceneProps = {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	children: ReactNode;
	cursorClass: string;
	onPointerCancel: (event: PointerEvent<HTMLCanvasElement>) => void;
	onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
	onPointerLeave: (event: PointerEvent<HTMLCanvasElement>) => void;
	onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
	onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
};

export function BuilderScene({
	canvasRef,
	children,
	cursorClass,
	onPointerCancel,
	onPointerDown,
	onPointerLeave,
	onPointerMove,
	onPointerUp
}: BuilderSceneProps) {
	return (
		<div className="relative h-full overflow-hidden overscroll-contain rounded-[3px] border-2 border-border bg-shade-1 [box-shadow:4px_4px_0_var(--border)]">
			<canvas
				ref={canvasRef}
				role="application"
				aria-label="Overhead floor builder"
				className={`block size-full touch-none overscroll-contain ${cursorClass}`}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerLeave={onPointerLeave}
				onPointerCancel={onPointerCancel}
			/>

			{children}
		</div>
	);
}
