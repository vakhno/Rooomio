import ReactDOM from "react-dom/client";

import "./global.css";

import { QueryProvider } from "@/providers/query-provider";
import { RouteProvider } from "@/providers/router-provider";
import { ToasterProvider } from "@/providers/toaster-provider";

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(
		<QueryProvider>
			<ToasterProvider />
			<RouteProvider />
		</QueryProvider>
	);
}
