import type { FloorLayout, FloorPlan } from "@shared/zod-schemas";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const floorPlanQueryKeys = {
	list: (buildingId: string) => ["floor-plan", "list", buildingId] as const,
	current: (buildingId: string) => ["floor-plan", "current", buildingId] as const,
	detail: (floorId: string) => ["floor-plan", "detail", floorId] as const
};

type ApiProps = {
	apiBaseUrl: string;
};

type SaveCurrentFloorPlanProps = ApiProps & {
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

const floorPlanRequest = async <T>(apiBaseUrl: string, path = "/api/floor-plans/current", init?: RequestInit): Promise<T> => {
	const response = await fetch(`${apiBaseUrl}${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...init?.headers
		}
	});
	const data = await response.json().catch(() => null) as T;

	if (!response.ok) {
		throw new Error("Floor plan request failed");
	}

	return data;
};

export const getCurrentFloorPlan = ({ apiBaseUrl, buildingId }: ApiProps & { buildingId: string }) =>
	floorPlanRequest<FloorPlan | null>(apiBaseUrl, `/api/floor-plans/current?buildingId=${encodeURIComponent(buildingId)}`);

export const listFloorPlans = ({ apiBaseUrl, buildingId }: ApiProps & { buildingId: string }) =>
	floorPlanRequest<FloorPlan[]>(apiBaseUrl, `/api/floor-plans?buildingId=${encodeURIComponent(buildingId)}`);

export const getFloorPlan = ({ apiBaseUrl, floorId }: ApiProps & { floorId: string }) =>
	floorPlanRequest<FloorPlan>(apiBaseUrl, `/api/floor-plans/${encodeURIComponent(floorId)}`);

export const saveCurrentFloorPlan = ({ apiBaseUrl, buildingId, floor = 1, name = "Floor", structure }: SaveCurrentFloorPlanProps) =>
	floorPlanRequest<FloorPlan>(apiBaseUrl, "/api/floor-plans/current", {
		method: "PUT",
		body: JSON.stringify({ buildingId, floor, name, structure })
	});

export const useBuildingFloorPlans = ({ apiBaseUrl, buildingId }: ApiProps & { buildingId: string }) =>
	useQuery({
		enabled: Boolean(buildingId),
		queryKey: floorPlanQueryKeys.list(buildingId),
		queryFn: () => listFloorPlans({ apiBaseUrl, buildingId })
	});

export const useFloorPlan = ({ apiBaseUrl, floorId }: ApiProps & { floorId: string }) =>
	useQuery({
		enabled: Boolean(floorId),
		queryKey: floorPlanQueryKeys.detail(floorId),
		queryFn: () => getFloorPlan({ apiBaseUrl, floorId })
	});

export const useCurrentFloorPlan = ({ apiBaseUrl, buildingId }: ApiProps & { buildingId: string }) =>
	useQuery({
		enabled: Boolean(buildingId),
		queryKey: floorPlanQueryKeys.current(buildingId),
		queryFn: () => getCurrentFloorPlan({ apiBaseUrl, buildingId })
	});

export const useSaveCurrentFloorPlan = ({ apiBaseUrl, buildingId }: ApiProps & { buildingId: string }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ floor, name, structure }: SaveCurrentFloorPlanMutationInput) => saveCurrentFloorPlan({ apiBaseUrl, buildingId, floor, name, structure }),
		onSuccess: (floorPlan) => {
			queryClient.setQueryData(floorPlanQueryKeys.current(buildingId), floorPlan);
			void queryClient.invalidateQueries({ queryKey: floorPlanQueryKeys.list(buildingId) });
		}
	});
};
