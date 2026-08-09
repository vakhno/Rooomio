/** Default app meta for head() - framework-agnostic */

export const DEFAULT_APP_TITLE = "App Template";

export const DEFAULT_HEAD = {
	meta: [
		{ title: DEFAULT_APP_TITLE }
	]
} as const;

/** Per-route page titles */
export const HOME_TITLE = "App Template - Home";
export const RULES_TITLE = "App Template - Rules";
export const POLICY_TITLE = "App Template - Privacy";
export const TERMS_TITLE = "App Template - Terms";
export const AUTH_CALLBACK_TITLE = "App Template - Signing in";

/** Simple head configs for routes with minimal meta */
export const RULES_HEAD = { meta: [{ title: RULES_TITLE }] } as const;
export const POLICY_HEAD = { meta: [{ title: POLICY_TITLE }] } as const;
export const TERMS_HEAD = { meta: [{ title: TERMS_TITLE }] } as const;
export const AUTH_CALLBACK_HEAD = { meta: [{ title: AUTH_CALLBACK_TITLE }] } as const;
