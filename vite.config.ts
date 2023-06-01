import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],

	// Tomado de https://rud.is/w/vite-webr-lit/
	server: {
		headers: {
			// for serving locally
			"Cache-Control": "no-cache; max-age=1",
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Resource-Policy": "cross-origin",
		},
	},
});
