import { HOME_TITLE } from "./meta";

export interface HeadConfig {
	meta: Array<{ title?: string; name?: string; property?: string; content?: string }>;
	links?: Array<{ rel?: string; href?: string }>;
	scripts?: Array<{ type?: string; children?: string }>;
}

const HOME_META = [
	{ title: HOME_TITLE },
	{ name: "description", content: "A clean app template with auth, routing, PostgreSQL, and Drizzle." },
	{ name: "robots", content: "index, follow" },
	{ property: "og:type", content: "website" },
	{ property: "og:title", content: HOME_TITLE },
	{ property: "og:description", content: "A clean app template with auth, routing, PostgreSQL, and Drizzle." },
	{ name: "twitter:card", content: "summary_large_image" },
	{ name: "twitter:title", content: HOME_TITLE },
	{ name: "twitter:description", content: "A clean app template with auth, routing, PostgreSQL, and Drizzle." }
] as const;

const HOME_LD_JSON = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	"name": "App Template",
	"description": "A clean app template with auth, routing, PostgreSQL, and Drizzle.",
	"applicationCategory": "DeveloperApplication",
	"operatingSystem": "Web Browser"
};

export function getHomeHead(baseUrl: string): HeadConfig {
	const base = baseUrl.replace(/\/$/, "");
	return {
		meta: [...HOME_META],
		links: [{ rel: "canonical", href: base || baseUrl || "/" }],
		scripts: [{ type: "application/ld+json", children: JSON.stringify(HOME_LD_JSON) }]
	};
}
