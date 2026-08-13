import type { FloorPlan } from "@shared/zod-schemas";

import { useQuery } from "@tanstack/react-query";

import { floorPlanQueryKeys } from "..";

type GetFloorPlanProps = {
	apiBaseUrl: string;
	floorId: string;
};

export const getFloorPlan = async ({ apiBaseUrl, floorId }: GetFloorPlanProps) => {
	const response = await fetch(`${apiBaseUrl}/api/floor-plans/${encodeURIComponent(floorId)}`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});
	const data = await response.json().catch(() => null) as FloorPlan;

	if (!response.ok)
		throw new Error("Floor plan request failed");

	return data;
};

export const useFloorPlan = ({ apiBaseUrl, floorId }: GetFloorPlanProps) =>
	useQuery({
		enabled: Boolean(floorId),
		queryKey: floorPlanQueryKeys.detail(floorId),
		queryFn: () => getFloorPlan({ apiBaseUrl, floorId })
	});
