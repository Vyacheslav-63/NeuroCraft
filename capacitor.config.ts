/**
 * Capacitor configuration for building native Android (.apk/.aab) and iOS (.ipa) packages
 * @author Поставной Вячеслав Алексеевич
 */
const config = {
  appId: 'ru.postavnoy.neurocraft',
  appName: 'NeuroCraft',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#0B0F19',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#0B0F19',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0B0F19',
  },
};

export default config;
