import type { FloorPlan } from "@shared/zod-schemas";

import { useQuery } from "@tanstack/react-query";

import { floorPlanQueryKeys } from "..";

type ListFloorPlansProps = {
	apiBaseUrl: string;
	buildingId: string;
};

export const listFloorPlans = async ({ apiBaseUrl, buildingId }: ListFloorPlansProps) => {
	const response = await fetch(`${apiBaseUrl}/api/floor-plans?buildingId=${encodeURIComponent(buildingId)}`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});
	const data = await response.json().catch(() => null) as FloorPlan[];

	if (!response.ok)
		throw new Error("Floor plan request failed");

	return data;
};

export const useBuildingFloorPlans = ({ apiBaseUrl, buildingId }: ListFloorPlansProps) =>
	useQuery({
		enabled: Boolean(buildingId),
		queryKey: floorPlanQueryKeys.list(buildingId),
		queryFn: () => listFloorPlans({ apiBaseUrl, buildingId })
	});
