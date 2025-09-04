const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix import.meta issue for web
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Web-specific resolver configuration
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

module.exports = config;