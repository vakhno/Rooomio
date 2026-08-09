import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/test.ts", "src/**/test.tsx"],
		passWithNoTests: true
	}
});
