export const floorPlanTablesSql = `
	create table if not exists "floorPlan" (
		id text primary key,
		"userId" text references "user"(id) on delete cascade,
		"ownerId" text references "user"(id) on delete cascade,
		"buildingId" text references "building"(id) on delete cascade,
		floor integer not null default 1,
		name text not null,
		layout jsonb,
		structure jsonb,
		"createdAt" timestamp not null,
		"updatedAt" timestamp not null
	);

	alter table "floorPlan" add column if not exists "ownerId" text references "user"(id) on delete cascade;
	alter table "floorPlan" add column if not exists "buildingId" text references "building"(id) on delete cascade;
	alter table "floorPlan" add column if not exists floor integer not null default 1;
	alter table "floorPlan" add column if not exists structure jsonb;
	alter table "floorPlan" alter column "userId" drop not null;
	alter table "floorPlan" alter column layout drop not null;
	update "floorPlan" set structure = layout where structure is null and layout is not null;
	update "floorPlan" set "ownerId" = "userId" where "ownerId" is null and "userId" is not null;
	drop index if exists "floorPlan_userId_unique";
	drop index if exists "floorPlan_buildingId_unique";
	create unique index if not exists "floorPlan_buildingId_floor_unique" on "floorPlan" ("buildingId", floor) where "buildingId" is not null;
`;
