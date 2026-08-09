export default {
	"*.{ts,tsx,js,jsx}": [
		() => "tsc --noEmit --project tsconfig.app.json"
	],
	"*": [
		"eslint --fix"
	]
};
