import { z } from "zod";
import { CONSTANTS } from "@shared/constants";
import { DEFAULT_LOCALE, DICTIONARY } from "@shared/locales";

const content = DICTIONARY[DEFAULT_LOCALE].validation;

export const SignInInputSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.pipe(z.email(`${content.auth.email}`)),
	password: z
		.string()
		.min(CONSTANTS.auth.password.min, `${content.auth.password.min(CONSTANTS.auth.password.min)}`)
		.max(CONSTANTS.auth.password.max, `${content.auth.password.max(CONSTANTS.auth.password.max)}`),
});

export type SignInInput = z.infer<typeof SignInInputSchema>;
