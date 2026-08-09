export type AuthRequestProps = {
	apiBaseUrl: string;
	init?: RequestInit;
	path: string;
};

export const authRequest = async <T>({
	apiBaseUrl,
	init,
	path
}: AuthRequestProps): Promise<T> => {
	const response = await fetch(`${apiBaseUrl}/api/auth${path}`, {
		...init,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...init?.headers
		}
	});

	const data = await response.json().catch(() => null) as T;

	if (!response.ok) {
		throw new Error("Auth request failed");
	}

	return data;
};
