import type { CookieOptions } from "express";

import { TOKEN_TTL_SECONDS } from "../../routes/auth/session.js";

export const tokenCookieOptions = (): CookieOptions => {
	const appUrl = process.env.VITE_APP_URL || "";
	const secure = appUrl.startsWith("https://");

	return {
		httpOnly: true,
		secure,
		sameSite: secure ? "none" : "lax",
		path: "/",
		maxAge: TOKEN_TTL_SECONDS * 1000,
	};
};
