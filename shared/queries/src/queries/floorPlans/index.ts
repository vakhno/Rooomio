export const floorPlanQueryKeys = {
	list: (buildingId: string) => ["floor-plan", "list", buildingId] as const,
	current: (buildingId: string) => ["floor-plan", "current", buildingId] as const,
	detail: (floorId: string) => ["floor-plan", "detail", floorId] as const
};
