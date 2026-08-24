import { z } from "zod";

export const ROLES = { USER: "user", ADMIN: "admin" } as const;
export const ROLES_LIST = [ROLES.USER, ROLES.ADMIN] as const;
export const DEFAULT_USER_ROLE = ROLES.USER;

export const UserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	image: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	role: z.enum(ROLES_LIST)
});

export type UserSchemaType = z.infer<typeof UserSchema>;

export type RoleType = z.infer<typeof UserSchema.shape.role>;

export type ClientSessionUser = Omit<UserSchemaType, "createdAt" | "updatedAt"> & {
	createdAt: string;
	updatedAt: string;
};

export type ClientSession = {
	user: ClientSessionUser;
	session: {
		expiresAt: string;
	};
};
