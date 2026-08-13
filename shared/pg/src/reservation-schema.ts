export const reservationTablesSql = `
	create table if not exists "reservation" (
		id text primary key,
		"ownerId" text not null references "user"(id) on delete cascade,
		"floorId" text not null references "floorPlan"(id) on delete cascade,
		"roomId" text not null,
		"roomName" text not null,
		title text not null,
		start timestamptz not null,
		"end" timestamptz not null,
		"seriesId" text,
		"seriesIndex" integer,
		"seriesCount" integer,
		"createdAt" timestamp not null default now()
	);

	create index if not exists "reservation_ownerId_idx" on "reservation" ("ownerId");
	create index if not exists "reservation_roomId_idx" on "reservation" ("roomId");
	create index if not exists "reservation_seriesId_idx" on "reservation" ("seriesId") where "seriesId" is not null;
`;

