export const generateUniqueEmail = ({ prefix }: { prefix: string }): string => {
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
};
