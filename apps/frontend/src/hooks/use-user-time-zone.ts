import { useMemo } from "react";

export function useUserTimeZone(): string {
	return useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
}
