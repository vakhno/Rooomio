import type { FloorPlan } from "@shared/zod-schemas";

import { useQuery } from "@tanstack/react-query";

import { floorPlanQueryKeys } from "..";

type GetCurrentFloorPlanProps = {
	apiBaseUrl: string;
	buildingId: string;
};

export const getCurrentFloorPlan = async ({ apiBaseUrl, buildingId }: GetCurrentFloorPlanProps) => {
	const response = await fetch(`${apiBaseUrl}/api/floor-plans/current?buildingId=${encodeURIComponent(buildingId)}`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});
	const data = await response.json().catch(() => null) as FloorPlan | null;

	if (!response.ok)
		throw new Error("Floor plan request failed");

	return data;
};

export const useCurrentFloorPlan = ({ apiBaseUrl, buildingId }: GetCurrentFloorPlanProps) =>
	useQuery({
		enabled: Boolean(buildingId),
		queryKey: floorPlanQueryKeys.current(buildingId),
		queryFn: () => getCurrentFloorPlan({ apiBaseUrl, buildingId })
	});
