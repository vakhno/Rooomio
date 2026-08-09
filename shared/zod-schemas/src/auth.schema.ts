import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;

export const SignInSchema = z.object({
	email: z.email("Enter a valid email"),
	password: z
		.string()
		.min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
		.max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
});

export const SignUpSchema = SignInSchema.extend({
	name: z
		.string()
		.min(1, "Name is required")
		.max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`)
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type SignInInput = SignInSchemaType;
export type SignUpInput = SignUpSchemaType;
