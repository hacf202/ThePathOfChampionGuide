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
						// 1. UI Libraries (Leaf/Standalone components)
						if (
							id.includes("lucide-react") ||
							id.includes("framer-motion") ||
							id.includes("react-icons") ||
							id.includes("@heroicons") ||
							id.includes("sweetalert2") ||
							id.includes("react-toastify")
						) {
							return "vendor-ui";
						}

						// 2. Framework & Core (Highly interconnected logic)
						// Grouping React and AWS Amplify together as they are tightly coupled via UI-React wrappers
						if (
							id.includes("/react/") ||
							id.includes("/react-dom/") ||
							id.includes("/react-router/") ||
							id.includes("/react-router-dom/") ||
							id.includes("/scheduler/") ||
							id.includes("/use-sync-external-store/") ||
							id.includes("/react-is/") ||
							id.includes("/prop-types/") ||
							id.includes("/object-assign/") ||
							id.includes("aws-amplify") ||
							id.includes("@aws-amplify") ||
							id.includes("amazon-cognito-identity-js") ||
							id.includes("@aws-sdk")
						) {
							return "vendor-framework";
						}

						// 3. Charts (Specialized leaf dependencies)
						if (id.includes("recharts") || id.includes("recharts-scale") || id.includes("d3-")) {
							return "vendor-charts";
						}

						// 4. Default: Let Vite handle orphans automatically.
						// DO NOT return a catch-all "vendor-utils" as it creates massive circular dependency loops.
					}
				},
			},
		},
	},
});
