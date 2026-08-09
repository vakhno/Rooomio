import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	role: text("role").notNull().default("user"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

export const authSchema = {
	user,
	session,
	account,
	verification,
};

export const authTablesSql = `
	create table if not exists "user" (
		id text primary key,
		name text not null,
		email text not null unique,
		"emailVerified" boolean not null,
		image text,
		"createdAt" timestamp not null,
		"updatedAt" timestamp not null,
		role text not null default 'user'
	);

	create table if not exists "session" (
		id text primary key,
		"expiresAt" timestamp not null,
		token text not null unique,
		"createdAt" timestamp not null,
		"updatedAt" timestamp not null,
		"ipAddress" text,
		"userAgent" text,
		"userId" text not null references "user"(id) on delete cascade
	);

	create table if not exists "account" (
		id text primary key,
		"accountId" text not null,
		"providerId" text not null,
		"userId" text not null references "user"(id) on delete cascade,
		"accessToken" text,
		"refreshToken" text,
		"idToken" text,
		"accessTokenExpiresAt" timestamp,
		"refreshTokenExpiresAt" timestamp,
		scope text,
		password text,
		"createdAt" timestamp not null,
		"updatedAt" timestamp not null
	);

	create table if not exists "verification" (
		id text primary key,
		identifier text not null,
		value text not null,
		"expiresAt" timestamp not null,
		"createdAt" timestamp,
		"updatedAt" timestamp
	);
`;
