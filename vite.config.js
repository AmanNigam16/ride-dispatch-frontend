import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

function safeOrigin(url, fallback) {
  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = safeOrigin(env.VITE_API_BASE_URL, "http://localhost:8080");
  const socketOrigin = safeOrigin(env.VITE_RIDE_SOCKET_URL, apiOrigin);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@tanstack/react-query": fileURLToPath(
          new URL("./node_modules/@tanstack/react-query/src/index.ts", import.meta.url)
        ),
        "@tanstack/query-core": fileURLToPath(
          new URL("./node_modules/@tanstack/query-core/src/index.ts", import.meta.url)
        )
      }
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true
        },
        "/socket.io": {
          target: socketOrigin,
          changeOrigin: true,
          ws: true
        }
      }
    }
  };
});
