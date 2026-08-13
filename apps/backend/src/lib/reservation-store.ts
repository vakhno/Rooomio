import type { ReservationStore, RoomReservationWire } from "@shared/sockets";

import { getPgPool } from "@shared/pg";

interface ReservationRow {
	end: Date;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	seriesCount?: number | null;
	seriesId?: string | null;
	seriesIndex?: number | null;
	start: Date;
	title: string;
}

const toReservationWire = (row: ReservationRow): RoomReservationWire => ({
	end: row.end.toISOString(),
	floorId: row.floorId,
	id: row.id,
	ownerId: row.ownerId,
	roomId: row.roomId,
	roomName: row.roomName,
	seriesCount: row.seriesCount ?? undefined,
	seriesId: row.seriesId ?? undefined,
	seriesIndex: row.seriesIndex ?? undefined,
	start: row.start.toISOString(),
	title: row.title,
});

const reservationSelect = `
	select id, "ownerId", "floorId", "roomId", "roomName", title, start, "end", "seriesId", "seriesIndex", "seriesCount"
	from "reservation"
`;

export const createPostgresReservationStore = (): ReservationStore => ({
	create: async (reservations) => {
		for (const reservation of reservations) {
			await getPgPool().query(
				`insert into "reservation" (id, "ownerId", "floorId", "roomId", "roomName", title, start, "end", "seriesId", "seriesIndex", "seriesCount")
				 values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
				[
					reservation.id,
					reservation.ownerId,
					reservation.floorId,
					reservation.roomId,
					reservation.roomName,
					reservation.title,
					reservation.start,
					reservation.end,
					reservation.seriesId ?? null,
					reservation.seriesIndex ?? null,
					reservation.seriesCount ?? null,
				],
			);
		}
	},
	delete: async (ids) => {
		await getPgPool().query(`delete from "reservation" where id = any($1::text[])`, [ids]);
	},
	get: async (id) => {
		const result = await getPgPool().query<ReservationRow>(`${reservationSelect} where id = $1 limit 1`, [id]);
		return result.rows[0] ? toReservationWire(result.rows[0]) : null;
	},
	listByOwner: async (ownerId) => {
		const result = await getPgPool().query<ReservationRow>(`${reservationSelect} where "ownerId" = $1 order by start asc`, [ownerId]);
		return result.rows.map(toReservationWire);
	},
	listByRoom: async (roomId) => {
		const result = await getPgPool().query<ReservationRow>(`${reservationSelect} where "roomId" = $1 order by start asc`, [roomId]);
		return result.rows.map(toReservationWire);
	},
	listBySeries: async (seriesId, ownerId) => {
		const result = await getPgPool().query<ReservationRow>(`${reservationSelect} where "seriesId" = $1 and "ownerId" = $2 order by start asc`, [seriesId, ownerId]);
		return result.rows.map(toReservationWire);
	},
});
