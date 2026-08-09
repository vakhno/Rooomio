import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: [
			"src/utils/pathMatchesRoutePrefix/test.ts",
			"src/utils/isAuthRequiredPage/test.ts",
			"src/utils/isAdminRoleRequiredPage/test.ts"
		]
	}
});
