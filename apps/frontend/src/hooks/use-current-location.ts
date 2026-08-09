import { useLocation } from "@tanstack/react-router";

export function useCurrentLocation() {
	const { pathname, search } = useLocation();
	const origin = window.location.origin;

	return {
		origin,
		pathname,
		search
	};
}
