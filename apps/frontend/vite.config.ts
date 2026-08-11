import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	envDir: "../../",
	server: {
		proxy: {
			"/api/auth": {
				target: process.env.VITE_API_URL,
				changeOrigin: true,
				secure: true
			},
			"/api/floor-plans": {
				target: process.env.VITE_API_URL,
				changeOrigin: true,
				secure: true
			}
		},
		host: "0.0.0.0",
		port: Number(process.env.VITE_PORT) || 5173,
		watch: {
			usePolling: true,
			interval: 100
		},
		allowedHosts: (() => {
			const allowedHosts = process.env.VITE_ALLOWED_HOSTS;

			if (!allowedHosts) {
				return true;
			}

			const allowedHostsList: string[] = allowedHosts.split(",").map((allowedHost: string) => allowedHost.trim()).filter((allowedHost: string) => allowedHost);

			return allowedHostsList;
		})()
	},
	plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), svgr(), react(), tailwindcss(), tsconfigPaths()]
});
