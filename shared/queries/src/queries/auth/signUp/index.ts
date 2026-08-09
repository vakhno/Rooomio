import type { ClientSession, SignUpInput } from "@shared/zod-schemas";

import {
	type QueryClient,
	useMutation,
	useQueryClient,
	type UseMutationOptions
} from "@tanstack/react-query";

import { authRequest } from "../request";

type SignUpEmailProps = {
	apiBaseUrl: string;
	data: SignUpInput;
};

export const signUpEmail = ({ apiBaseUrl, data }: SignUpEmailProps): Promise<ClientSession> =>
	authRequest<ClientSession>({
		apiBaseUrl,
		path: "/sign-up",
		init: {
			method: "POST",
			body: JSON.stringify(data)
		}
	});

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
