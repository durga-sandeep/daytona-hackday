import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Listen on all network interfaces for cloud access
    port: 8080,
    hmr: {
      clientPort: 443, // Use HTTPS port for ngrok
    },
    // Allow ngrok and other external hosts
    allowedHosts: [
      '.ngrok-free.app',
      '.ngrok.app',
      'localhost',
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
