export const buildingTablesSql = `
	create table if not exists "building" (
		id text primary key,
		"ownerId" text not null references "user"(id) on delete cascade,
		name text not null,
		address text not null,
		"floorCount" integer not null,
		"createdAt" timestamp not null,
		"updatedAt" timestamp not null
	);

	create index if not exists "building_ownerId_idx" on "building" ("ownerId");
`;
