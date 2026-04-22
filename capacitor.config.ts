import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ateliermeridian.roomservice',
  appName: 'Room Service',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
