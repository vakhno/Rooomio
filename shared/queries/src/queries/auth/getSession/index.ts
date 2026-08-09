import type { ClientSession } from "@shared/zod-schemas";

import {
	useQuery,
	type UseQueryOptions
} from "@tanstack/react-query";

import { authRequest } from "../request";

export type GetSessionProps = {
	apiBaseUrl: string;
};

export const getSession = async ({ apiBaseUrl }: GetSessionProps): Promise<ClientSession | null> => {
	try {
		return await authRequest<ClientSession | null>({ apiBaseUrl, path: "/session" });
	}
	catch {
		return null;
	}
};

type UseGetSessionProps = GetSessionProps & {
	options?: Omit<Partial<UseQueryOptions<ClientSession | null, Error>>, "queryKey" | "queryFn">;
};

const useGetSessionDefaultOptions: Partial<UseGetSessionProps["options"]> = {
	refetchIntervalInBackground: true,
	refetchOnWindowFocus: true,
	refetchInterval: 10 * 60 * 1000,
	staleTime: 10 * 60 * 1000
};

export function useGetSession({ apiBaseUrl, options }: UseGetSessionProps) {
	return useQuery<ClientSession | null, Error>({
		queryKey: ["session"],
		queryFn: () => getSession({ apiBaseUrl }),
		...options,
		...useGetSessionDefaultOptions
	});
}
