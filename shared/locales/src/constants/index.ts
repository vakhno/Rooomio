export const LOCALES_LIST = ["en"] as const;
export const DEFAULT_LOCALE = "en" as (typeof LOCALES_LIST)[number];

const SITE_NAME = "App Template";
const DEFAULT_OG_TYPE = "website";
const DEFAULT_TWITTER_CARD = "summary_large_image";
const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1.0";
const DEFAULT_OG_LOCALE = "en_US";
const DEFAULT_THEME_COLOR = "#ffdd00";

const routeSeo = (name: string, description: string, robots = "index, follow") => ({
	title: `${SITE_NAME} - ${name}`,
	description,
	keywords: `${SITE_NAME}, app template, auth, postgres, drizzle`,
	robots,
	author: SITE_NAME,
	ogType: DEFAULT_OG_TYPE,
	ogTitle: `${SITE_NAME} - ${name}`,
	ogDescription: description,
	ogSiteName: SITE_NAME,
	twitterCard: DEFAULT_TWITTER_CARD,
	twitterTitle: `${SITE_NAME} - ${name}`,
	twitterDescription: description,
	jsonLd: {},
});

export const DICTIONARY = {
	en: {
		pages: {
			home: {
				title: "Rooomio",
				description: "Book coworking rooms, meeting spaces, and work spots from one floor plan.",
				bookAction: "Book",
				createAction: "Create",
			},
		},
		toast: {
			error: {
				socialAuthentication: {
					heading: "Authentication failed",
					description: "There was an error signing in with Google. Please try again.",
				},
			},
		},
		seo: {
			defaults: {
				themeColor: DEFAULT_THEME_COLOR,
				viewport: DEFAULT_VIEWPORT,
				ogLocale: DEFAULT_OG_LOCALE,
				ogImage: "",
				ogImageWidth: "",
				ogImageHeight: "",
				ogImageAlt: "",
				twitterSite: "",
				twitterImage: "",
				twitterImageWidth: "",
				twitterImageHeight: "",
			},
			routes: {
				home: {
					...routeSeo("Home", "A clean app template with auth, routing, PostgreSQL, and Drizzle."),
					jsonLd: {
						"@context": "https://schema.org",
						"@type": "WebApplication",
						name: SITE_NAME,
						description: "A clean app template with auth, routing, PostgreSQL, and Drizzle.",
						applicationCategory: "DeveloperApplication",
						operatingSystem: "Web Browser",
					},
				},
				login: routeSeo("Login", "Sign in to your account.", "noindex, nofollow"),
				profile: routeSeo("Profile", "Manage your profile and account settings.", "noindex, nofollow"),
			},
		},
	},
} as const satisfies Record<typeof LOCALES_LIST[number], Record<string, unknown>>;
