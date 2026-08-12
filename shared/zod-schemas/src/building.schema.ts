import { z } from "zod";

export const CreateBuildingSchema = z.object({
	name: z.string().trim().min(1).max(120),
	address: z.string().trim().min(1).max(240),
	floorCount: z.number().int().min(1).max(200)
});

export type CreateBuildingInput = z.infer<typeof CreateBuildingSchema>;

export type Building = CreateBuildingInput & {
	id: string;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
};
