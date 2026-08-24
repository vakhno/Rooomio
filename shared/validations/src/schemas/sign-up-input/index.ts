import { z } from "zod";
import { CONSTANTS } from "@shared/constants";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";
import { SignInInputSchema } from "../sign-in-input";

const content = DICTIONARY[DEFAULT_LOCALE].validation;

export const SignUpInputSchema = SignInInputSchema.extend({
	name: z
		.string()
		.min(CONSTANTS.auth.name.min, `${content.auth.name.min(CONSTANTS.auth.name.min)}`)
		.max(CONSTANTS.auth.name.max, `${content.auth.name.max(CONSTANTS.auth.name.max)}`),
});

export type SignUpInput = z.infer<typeof SignUpInputSchema>;
