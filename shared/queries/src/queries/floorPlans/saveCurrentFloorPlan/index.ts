import type { FloorLayout, FloorPlan } from "@shared/zod-schemas";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { floorPlanQueryKeys } from "..";

type SaveCurrentFloorPlanProps = {
	apiBaseUrl: string;
	buildingId: string;
	floor?: number;
	name?: string;
	structure: FloorLayout;
};

type SaveCurrentFloorPlanMutationInput = {
	floor: number;
	name: string;
	structure: FloorLayout;
};

export const saveCurrentFloorPlan = async ({ apiBaseUrl, buildingId, floor = 1, name = "Floor", structure }: SaveCurrentFloorPlanProps) => {
	const response = await fetch(`${apiBaseUrl}/api/floor-plans/current`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ buildingId, floor, name, structure })
	});
	const data = await response.json().catch(() => null) as FloorPlan;

	if (!response.ok)
		throw new Error("Floor plan request failed");

	return data;
};

export const useSaveCurrentFloorPlan = ({ apiBaseUrl, buildingId }: Pick<SaveCurrentFloorPlanProps, "apiBaseUrl" | "buildingId">) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ floor, name, structure }: SaveCurrentFloorPlanMutationInput) => saveCurrentFloorPlan({ apiBaseUrl, buildingId, floor, name, structure }),
		onSuccess: (floorPlan) => {
			queryClient.setQueryData(floorPlanQueryKeys.current(buildingId), floorPlan);
			void queryClient.invalidateQueries({ queryKey: floorPlanQueryKeys.list(buildingId) });
		}
	});
};
