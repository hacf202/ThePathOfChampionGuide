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
						// Ưu tiên các thư viện UI rời rạc để tránh bị gộp vào vendor-react quá sớm
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

						// React Core và các thư viện nội bộ thiết yếu
						if (
							id.includes("/react/") ||
							id.includes("/react-dom/") ||
							id.includes("/react-router/") ||
							id.includes("/react-router-dom/") ||
							id.includes("/scheduler/") ||
							id.includes("/use-sync-external-store/") ||
							id.includes("/react-is/") ||
							id.includes("/prop-types/") ||
							id.includes("/object-assign/")
						) {
							return "vendor-react";
						}

						if (id.includes("recharts") || id.includes("recharts-scale") || id.includes("d3-")) {
							return "vendor-charts";
						}

						if (
							id.includes("@aws-sdk") ||
							id.includes("amazon-cognito-identity-js") ||
							id.includes("aws-amplify") ||
							id.includes("@aws-amplify")
						) {
							return "vendor-aws";
						}

						return "vendor-utils";
					}
				},
			},
		},
	},
});
