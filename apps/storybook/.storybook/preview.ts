import type { Preview } from "@storybook/react-vite";

import "@shared/design-system/styles.css";
import "../src/preview.css";

const preview: Preview = {
	parameters: {
		backgrounds: {
			options: {
				map: { name: "Map tile", value: "#d7caa3" },
				night: { name: "Night HUD", value: "#242416" }
			}
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
