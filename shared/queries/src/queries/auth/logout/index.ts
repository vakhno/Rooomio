import {
	type QueryClient,
	useMutation,
	type UseMutationOptions,
	useQueryClient
} from "@tanstack/react-query";

import { authRequest } from "../request";

type LogoutProps = {
	apiBaseUrl: string;
};

export const logout = async ({ apiBaseUrl }: LogoutProps) => {
	await authRequest<null>({
		apiBaseUrl,
		path: "/sign-out",
		init: { method: "POST" }
	});
};

const logoutOnSuccess = (queryClient: QueryClient) => {
	queryClient.setQueryData(["session"], null);
};

type UseLogoutProps = LogoutProps & {
	options?: UseMutationOptions<void, Error, void>;
};

export function useLogout({ apiBaseUrl, options }: UseLogoutProps) {
	const queryClient = useQueryClient();
	const { onSuccess, ...restOptions } = options ?? {};

	return useMutation({
		mutationFn: () => logout({ apiBaseUrl }),
		onSuccess: (...args) => {
			logoutOnSuccess(queryClient);
			onSuccess?.(...args);
		},
		...restOptions
	});
}
