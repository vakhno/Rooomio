export const CONSTANTS = {
	auth: {
		password: {
			min: 8,
			max: 72,
			bcryptSaltRounds: 10,
		},
		token: {
			cookieName: "token",
			ttlSeconds: 60 * 60 * 6,
		},
		name: {
			min: 1,
			max: 100,
		},
	},
	building: {
		name: {
			min: 1,
			max: 120,
		},
		address: {
			min: 1,
			max: 240,
		},
		floor_count: {
			min: 1,
			max: 200,
		},
	},
} as const;
