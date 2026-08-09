import { AUTH_REQUIRED_PAGES_LIST } from "../../constants";
import { pathMatchesRoutePrefix } from "../pathMatchesRoutePrefix";

export const isAuthRequiredPage = (path: string) => {
	return AUTH_REQUIRED_PAGES_LIST.some(prefix => pathMatchesRoutePrefix(path, prefix));
};