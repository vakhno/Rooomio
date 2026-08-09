/** Frontend app route path constants */

export const HOME = "/";
export const RULES = "/rules";
export const POLICY = "/policy";
export const TERMS = "/terms";

/** Path check helpers - returns true for routes that don't require auth */

export function isPublicRoute(pathname: string): boolean {
	return pathname === HOME || pathname === RULES || pathname === POLICY || pathname === TERMS;
}

/** Redirect options when auth fails - use with redirect() in beforeLoad */
export function getAuthRedirect(): { to: string; search: { error: undefined } } {
	return {
		to: HOME,
		search: { error: undefined }
	};
}

/** Redirect options when admin check fails - use with redirect() in beforeLoad. */
export function getAdminRedirect(): { to: string } {
	return { to: HOME };
}
