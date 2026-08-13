import type { Building } from "@shared/zod-schemas";

import { useQuery } from "@tanstack/react-query";

import { buildingQueryKeys } from "..";

type ListBuildingsProps = {
	apiBaseUrl: string;
};

export const listBuildings = async ({ apiBaseUrl }: ListBuildingsProps) => {
	const response = await fetch(`${apiBaseUrl}/api/buildings`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});
	const data = await response.json().catch(() => null) as Building[];

	if (!response.ok)
		throw new Error("Building request failed");

	return data;
};

export const useBuildings = ({ apiBaseUrl }: ListBuildingsProps) =>
	useQuery({
		queryKey: buildingQueryKeys.list,
		queryFn: () => listBuildings({ apiBaseUrl })
	});
