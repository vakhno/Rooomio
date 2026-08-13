import type { Building, CreateBuildingInput } from "@shared/zod-schemas";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buildingQueryKeys } from "..";

type CreateBuildingProps = {
	apiBaseUrl: string;
	building: CreateBuildingInput;
};

export const createBuilding = async ({ apiBaseUrl, building }: CreateBuildingProps) => {
	const response = await fetch(`${apiBaseUrl}/api/buildings`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(building)
	});
	const data = await response.json().catch(() => null) as Building;

	if (!response.ok)
		throw new Error("Building request failed");

	return data;
};

export const useCreateBuilding = ({ apiBaseUrl }: Pick<CreateBuildingProps, "apiBaseUrl">) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (building: CreateBuildingInput) => createBuilding({ apiBaseUrl, building }),
		onSuccess: (building) => {
			queryClient.setQueryData<Building[]>(buildingQueryKeys.list, current => [building, ...(current ?? [])]);
			queryClient.setQueryData<Building[]>(buildingQueryKeys.my, current => [building, ...(current ?? [])]);
		}
	});
};
