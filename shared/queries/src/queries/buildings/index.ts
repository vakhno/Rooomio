import type { Building, CreateBuildingInput } from "@shared/zod-schemas";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const buildingQueryKeys = {
	list: ["buildings"] as const,
	my: ["buildings", "my"] as const
};

type ApiProps = {
	apiBaseUrl: string;
};

const buildingRequest = async <T>(apiBaseUrl: string, path = "", init?: RequestInit): Promise<T> => {
	const response = await fetch(`${apiBaseUrl}/api/buildings${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...init?.headers
		}
	});
	const data = await response.json().catch(() => null) as T;

	if (!response.ok)
		throw new Error("Building request failed");

	return data;
};

export const listBuildings = ({ apiBaseUrl }: ApiProps) =>
	buildingRequest<Building[]>(apiBaseUrl);

export const listMyBuildings = ({ apiBaseUrl }: ApiProps) =>
	buildingRequest<Building[]>(apiBaseUrl, "/my");

export const createBuilding = ({ apiBaseUrl, building }: ApiProps & { building: CreateBuildingInput }) =>
	buildingRequest<Building>(apiBaseUrl, "", {
	method: "POST",
	body: JSON.stringify(building)
});

export const useBuildings = ({ apiBaseUrl }: ApiProps) =>
	useQuery({
		queryKey: buildingQueryKeys.list,
		queryFn: () => listBuildings({ apiBaseUrl })
	});

export const useMyBuildings = ({ apiBaseUrl }: ApiProps) =>
	useQuery({
		queryKey: buildingQueryKeys.my,
		queryFn: () => listMyBuildings({ apiBaseUrl })
	});

export const useCreateBuilding = ({ apiBaseUrl }: ApiProps) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (building: CreateBuildingInput) => createBuilding({ apiBaseUrl, building }),
		onSuccess: (building) => {
			queryClient.setQueryData<Building[]>(buildingQueryKeys.list, current => [building, ...(current ?? [])]);
			queryClient.setQueryData<Building[]>(buildingQueryKeys.my, current => [building, ...(current ?? [])]);
		}
	});
};
