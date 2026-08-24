import { CONSTANTS } from "@shared/constants";

export const generateUniquePassword = (): string => {
	const { max, min } = CONSTANTS.auth.password;
	const password = `Password-${Date.now()}-${Math.random().toString(16).slice(2)}`;

	return password.slice(0, max).padEnd(min, "x");
};
