import { ADMIN_REQUIRED_PAGES_LIST } from "../../constants";
import { pathMatchesRoutePrefix } from "../pathMatchesRoutePrefix";

export const isAdminRoleRequiredPage = (path: string) => {
	return ADMIN_REQUIRED_PAGES_LIST.some(prefix => pathMatchesRoutePrefix(path, prefix));
};