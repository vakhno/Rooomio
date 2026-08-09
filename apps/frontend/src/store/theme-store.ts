import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
	theme: "light" | "dark";
}

interface ThemeStore {
	state: ThemeState;
	toggleTheme: () => void;
}

const useThemeStore = create<ThemeStore>()(
	persist(
		set => ({
			state: {
				theme: "light"
			},
			toggleTheme: () =>
				set(state => ({
					state: {
						...state.state,
						theme: state.state.theme === "light" ? "dark" : "light"
					}
				}))
		}),
		{
			name: "theme-storage",
			partialize: state => ({
				state: {
					theme: state.state.theme
				}
			})
		}
	)
);

export default useThemeStore;
