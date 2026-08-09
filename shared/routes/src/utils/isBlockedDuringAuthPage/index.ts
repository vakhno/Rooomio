import { BLOCKED_DURING_AUTH_LIST } from "../../constants";

export const isBlockedDuringAuthPage = (path: string) => {
    return BLOCKED_DURING_AUTH_LIST.some(page => path === page);
};