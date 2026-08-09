import type { ClientSession, SignInInput } from "@shared/zod-schemas";

import {
	type QueryClient,
	useMutation,
	useQueryClient,
	type UseMutationOptions
} from "@tanstack/react-query";

import { authRequest } from "../request";

type SignInEmailProps = {
	apiBaseUrl: string;
	data: SignInInput;
};

export const signInEmail = ({ apiBaseUrl, data }: SignInEmailProps): Promise<ClientSession> =>
	authRequest<ClientSession>({
		apiBaseUrl,
		path: "/sign-in",
		init: {
			method: "POST",
			body: JSON.stringify(data)
		}
	});

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
