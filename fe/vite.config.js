import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),

		nodePolyfills({
			global: true,
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: false,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
							return "vendor-react";
						}
						if (id.includes("lucide-react") || id.includes("framer-motion")) {
							return "vendor-ui";
						}
						if (id.includes("recharts") || id.includes("recharts-scale") || id.includes("d3-")) {
							return "vendor-charts";
						}
						if (id.includes("@aws-sdk") || id.includes("amazon-cognito-identity-js") || id.includes("aws-amplify")) {
							return "vendor-aws";
						}
						return "vendor-utils";
					}
				},
			},
		},
	},
});
