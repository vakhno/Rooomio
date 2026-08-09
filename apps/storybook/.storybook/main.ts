import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
	framework: "@storybook/react-vite",
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	viteFinal: async (config) => mergeConfig(config, {
		plugins: [tailwindcss()]
	})
};

export default config;
