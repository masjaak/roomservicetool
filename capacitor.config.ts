import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ateliermeridian.roomservice',
  appName: 'Room Service',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    url: 'http://192.168.18.189:5174',
    cleartext: true,
  },
};

export default config;
