import { z } from "zod";
import { CONSTANTS } from "@shared/constants";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

const content = DICTIONARY[DEFAULT_LOCALE].validation;

export const BuildingInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(CONSTANTS.building.name.min, content.building.name.min(CONSTANTS.building.name.min))
		.max(CONSTANTS.building.name.max, content.building.name.max(CONSTANTS.building.name.max)),
	address: z
		.string()
		.trim()
		.min(CONSTANTS.building.address.min, content.building.address.min(CONSTANTS.building.address.min))
		.max(CONSTANTS.building.address.max, content.building.address.max(CONSTANTS.building.address.max)),
	floorCount: z
		.number({
			message: content.building.floorCount.number,
		})
		.int(content.building.floorCount.int)
		.min(CONSTANTS.building.floor_count.min, content.building.floorCount.min(CONSTANTS.building.floor_count.min))
		.max(CONSTANTS.building.floor_count.max, content.building.floorCount.max(CONSTANTS.building.floor_count.max)),
});

export type BuildingInput = z.infer<typeof BuildingInputSchema>;
