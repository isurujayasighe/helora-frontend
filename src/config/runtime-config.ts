const appConfig = window.__APP_CONFIG__;

console.log("Loaded runtime config:", appConfig);

if (!appConfig) {
  throw new Error("runtime-config.js is missing or did not load");
}

export { appConfig };