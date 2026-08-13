import {
	type QueryClient,
	useMutation,
	type UseMutationOptions,
	useQueryClient
} from "@tanstack/react-query";

type LogoutProps = {
	apiBaseUrl: string;
};

export const logout = async ({ apiBaseUrl }: LogoutProps) => {
	const response = await fetch(`${apiBaseUrl}/api/auth/sign-out`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" }
	});

	if (!response.ok) {
		throw new Error("Auth request failed");
	}
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
