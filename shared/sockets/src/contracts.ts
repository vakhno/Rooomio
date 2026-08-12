export type RoomReservationWire = {
	end: string;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	start: string;
	title: string;
};

export type RoomReservationHold = {
	end: string;
	expiresAt: number;
	floorId: string;
	id: string;
	ownerId: string;
	roomId: string;
	roomName: string;
	start: string;
};

export type ReservationRoomPayload = {
	roomId: string;
};

export type ReservationHoldPayload = {
	end: string;
	floorId: string;
	holdId: string;
	roomId: string;
	roomName: string;
	start: string;
};

export type ReservationCommitPayload = {
	holdId: string;
	title: string;
};

export type ReservationDeletePayload = {
	id: string;
	roomId: string;
};

export type ReservationStatePayload = {
	holds: RoomReservationHold[];
	reservations: RoomReservationWire[];
};

export type ReservationAck =
	| { error: string; ok: false }
	| { ok: true };
