const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Workaround for Windows NativeWind v4 bug: use an absolute, POSIX-style path
const cssInputPath = path.resolve(__dirname, "app/global.css").replace(/\\/g, '/');

module.exports = withNativewind(config, {
  input: cssInputPath,
  // inline variables break PlatformColor in CSS variables
  inlineVariables: false,
  // We add className support manually
  globalClassNamePolyfill: false,
});
