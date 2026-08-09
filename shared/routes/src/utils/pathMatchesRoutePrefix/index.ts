/** Exact `prefix` or `prefix/...`, not sibling paths that merely share text. */
export const pathMatchesRoutePrefix = (pathname: string, prefix: string) => {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
};
