import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    // basicSsl(), 
    react(),
    tailwindcss(),
  ],
  // server: { 
  //   host: true, // Optional: helpful for testing on mobile/other devices
  //   port: 5174  // Ensure this matches your callback URLs
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});