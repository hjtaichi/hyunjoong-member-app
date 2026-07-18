module.exports = {
  preset: "jest-expo",
  clearMocks: true,
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "/dist/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
  ],
};