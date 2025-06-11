const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {
	wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {};
const configDefault = getDefaultConfig(__dirname);
const configMerge = mergeConfig(configDefault, config);

module.exports = wrapWithReanimatedMetroConfig(configMerge);
