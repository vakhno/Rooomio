import { useEffect } from "react";

import useThemeStore from "@/store/theme-store";

export function useTheme() {
	const { state, toggleTheme } = useThemeStore();

	useEffect(() => {
		const html = document.documentElement;

		html.classList.remove("light", "dark");
		html.classList.add(state.theme);
	}, [state.theme]);

	return { theme: state.theme, toggleTheme };
}
