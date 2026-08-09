import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { readFile, stat } from "node:fs/promises";

const root = resolve("apps/storybook/storybook-static");
const port = Number.parseInt(process.env.PORT ?? "6006", 10);
const types = {
	".css": "text/css",
	".html": "text/html",
	".js": "text/javascript",
	".json": "application/json",
	".svg": "image/svg+xml"
};

createServer(async (request, response) => {
	const pathname = decodeURIComponent(request.url?.split("?")[0] || "/");
	let filePath = join(root, pathname === "/" ? "index.html" : pathname);

	if (!filePath.startsWith(root)) {
		response.writeHead(403);
		response.end("Forbidden");
		return;
	}

	try {
		if (!(await stat(filePath)).isFile()) {
			filePath = join(root, "index.html");
		}
	}
	catch {
		filePath = join(root, "index.html");
	}

	const body = await readFile(filePath);
	response.writeHead(200, {
		"Content-Type": types[extname(filePath)] ?? "application/octet-stream"
	});
	response.end(body);
}).listen(port, "127.0.0.1", () => {
	console.log(`Storybook static preview: http://localhost:${port}`);
});
