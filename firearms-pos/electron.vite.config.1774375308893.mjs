// electron.vite.config.ts
import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import tailwindcss from "@tailwindcss/vite";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@shared": resolve("src/shared")
      }
    },
    build: {
      rollupOptions: {
        external: ["better-sqlite3"]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@shared": resolve("src/shared")
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve("src/renderer"),
        "@shared": resolve("src/shared")
      }
    },
    plugins: [tailwindcss()]
  }
});
export {
  electron_vite_config_default as default
};
