import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meditrack.app',
  appName: 'Meditrack',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  server: {
    cleartext: true,
  },
};

export default config;