// Node's watch dependency reporting sends objects over the same IPC channel
// NativeWind v4 uses for compiled CSS. Disable it before Metro spawns workers.
delete process.env.WATCH_REPORT_DEPENDENCIES;

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
