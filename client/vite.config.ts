import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [TanStackRouterVite({ target: "react" }), react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@shared": path.resolve(__dirname, "../shared/src"),
			"@server": path.resolve(__dirname, "../server/src"),
		},
	},
	server: {
		proxy: {
			"/auth": "http://localhost:3000",
			"/api": "http://localhost:3000",
		},
	},
})
