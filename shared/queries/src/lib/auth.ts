import { mutationOptions, queryOptions } from "@tanstack/react-query";

import type { ClientSession } from "@shared/zod-schemas";

import { getSession } from "../queries/auth/getSession";
import { logout } from "../queries/auth/logout";

export const authQueryKeys = {
	session: ["session"] as const
};

type AuthQueryProps = {
	apiBaseUrl: string;
};

const getSessionQueryFn = async ({ apiBaseUrl }: AuthQueryProps) => {
	return getSession({ apiBaseUrl });
};

export const getSessionQueryOptions = ({ apiBaseUrl }: AuthQueryProps) =>
	queryOptions<ClientSession | null, Error>({
		queryKey: authQueryKeys.session,
		queryFn: () => getSessionQueryFn({ apiBaseUrl })
	});

const logoutMutationFn = async ({ apiBaseUrl }: AuthQueryProps) => {
	await logout({ apiBaseUrl });
};

export const logoutMutationOptions = ({ apiBaseUrl }: AuthQueryProps) =>
	mutationOptions<void, Error, void>({
		mutationFn: () => logoutMutationFn({ apiBaseUrl })
	});

