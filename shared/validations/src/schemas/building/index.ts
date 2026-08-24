import { z } from "zod";
import { BuildingInputSchema } from "../building-input";

export const BuildingSchema = BuildingInputSchema.extend({
	id: z.string(),
	ownerId: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Building = z.infer<typeof BuildingSchema>;

