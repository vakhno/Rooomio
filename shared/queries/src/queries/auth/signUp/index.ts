import type { ClientSession, SignUpInput } from "@shared/zod-schemas";

import {
	type QueryClient,
	useMutation,
	useQueryClient,
	type UseMutationOptions
} from "@tanstack/react-query";

type SignUpEmailProps = {
	apiBaseUrl: string;
	data: SignUpInput;
};

export const signUpEmail = async ({ apiBaseUrl, data }: SignUpEmailProps): Promise<ClientSession> => {
	const response = await fetch(`${apiBaseUrl}/api/auth/sign-up`, {
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

type UseSignUpEmailProps = {
	apiBaseUrl: string;
	options?: UseMutationOptions<ClientSession, Error, SignUpInput>;
};

const signUpOnSuccess = (queryClient: QueryClient, session: ClientSession) => {
	queryClient.setQueryData(["session"], session);
};

export const useSignUpEmail = ({ apiBaseUrl, options }: UseSignUpEmailProps) => {
	const queryClient = useQueryClient();
	const { onSuccess, ...restOptions } = options ?? {};

	return useMutation({
		mutationFn: data => signUpEmail({ apiBaseUrl, data }),
		onSuccess: (...args) => {
			signUpOnSuccess(queryClient, args[0]);
			onSuccess?.(...args);
		},
		...restOptions
	});
};
