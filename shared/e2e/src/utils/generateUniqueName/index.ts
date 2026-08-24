import { CONSTANTS } from "@shared/constants";

export const generateUniqueName = ({ prefix }: { prefix: string }): string => {
	const { max, min } = CONSTANTS.auth.name;
	const name = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

	return name.slice(0, max).padEnd(min, "x");
};
