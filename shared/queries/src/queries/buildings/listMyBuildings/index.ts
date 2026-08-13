import type { Building } from "@shared/zod-schemas";

import { useQuery } from "@tanstack/react-query";

import { buildingQueryKeys } from "..";

type ListMyBuildingsProps = {
	apiBaseUrl: string;
};

export const listMyBuildings = async ({ apiBaseUrl }: ListMyBuildingsProps) => {
	const response = await fetch(`${apiBaseUrl}/api/buildings/my`, {
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});
	const data = await response.json().catch(() => null) as Building[];

	if (!response.ok)
		throw new Error("Building request failed");

	return data;
};

export const useMyBuildings = ({ apiBaseUrl }: ListMyBuildingsProps) =>
	useQuery({
		queryKey: buildingQueryKeys.my,
		queryFn: () => listMyBuildings({ apiBaseUrl })
	});
