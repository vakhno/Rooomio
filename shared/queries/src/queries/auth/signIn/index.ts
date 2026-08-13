import type { ClientSession, SignInInput } from "@shared/zod-schemas";

import {
	type QueryClient,
	useMutation,
	useQueryClient,
	type UseMutationOptions
} from "@tanstack/react-query";

type SignInEmailProps = {
	apiBaseUrl: string;
	data: SignInInput;
};

export const signInEmail = async ({ apiBaseUrl, data }: SignInEmailProps): Promise<ClientSession> => {
	const response = await fetch(`${apiBaseUrl}/api/auth/sign-in`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		throw new Error("Auth request failed");
	}

	return await response.json() as ClientSession;
};

type UseSignInEmailProps = {
	apiBaseUrl: string;
	options?: UseMutationOptions<ClientSession, Error, SignInInput>;
};

const signInOnSuccess = (queryClient: QueryClient, session: ClientSession) => {
	queryClient.setQueryData(["session"], session);
};

export const useSignInEmail = ({ apiBaseUrl, options }: UseSignInEmailProps) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restOptions } = options ?? {};

	return useMutation({
		mutationFn: data => signInEmail({ apiBaseUrl, data }),
		onSuccess: (...args) => {
			signInOnSuccess(queryClient, args[0]);
			onSuccess?.(...args);
		},
		...restOptions
	});
};
