import type { Express } from "express";

import { createServer } from "node:http";
import { Server } from "socket.io";

export function initSocketServer(app: Express) {
	const server = createServer(app);

	const io = new Server(server, {
		cors: {
			origin: process.env.VITE_APP_URL,
			credentials: true,
		},
	});

	return { io, server };
}
