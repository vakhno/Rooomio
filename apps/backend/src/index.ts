import { getPgPool } from "@shared/pg";
import { initSocketEvents, initSocketServer } from "@shared/sockets";
import { FloorLayoutSchema } from "@shared/validations";

import { createApp } from "./inits/create-app.js";
import { createPostgresReservationStore } from "./lib/reservation-store.js";
import { TOKEN_COOKIE_NAME, verifyToken } from "./routes/auth/session.js";

const expressApp = await createApp();

const { io, server } = initSocketServer(expressApp);

expressApp.set("io", io);

initSocketEvents(io, {
	getRoom: async ({ floorId, roomId }) => {
		const result = await getPgPool().query<{ structure: unknown }>(
			`select structure from "floorPlan" where id = $1 limit 1`,
			[floorId],
		);
		const parsed = FloorLayoutSchema.safeParse(result.rows[0]?.structure);

		if (!parsed.success)
			return null;

		const room = parsed.data.rooms.find(item => item.id === roomId);
		return room ? { id: room.id, name: room.name, schedule: room.schedule } : null;
	},
	getUserId: (socket) => {
		const cookieToken = socket.handshake.headers.cookie
			?.split(";")
			.map(part => part.trim())
			.find(part => part.startsWith(`${TOKEN_COOKIE_NAME}=`))
			?.slice(TOKEN_COOKIE_NAME.length + 1);
		const authToken = typeof socket.handshake.auth.token === "string" ? socket.handshake.auth.token : null;
		const token = cookieToken ?? authToken;

		return token ? verifyToken(decodeURIComponent(token))?.id ?? null : null;
	},
	reservations: createPostgresReservationStore(),
});

server.listen(process.env.PORT);
