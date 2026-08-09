export default {
	"*.{ts,tsx,js,jsx}": [
		() => "tsc --noEmit --project tsconfig.json",
	],
	"*": [
		"eslint --fix",
	],
};
