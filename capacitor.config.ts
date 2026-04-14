import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.credo.phorilab',
  appName: 'PHORI LAB',
  webDir: 'dist',
  server: {
    url: 'https://53088d3b-154b-49e8-9310-bd84f32d82c8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B5CF6',
      sound: 'notification.wav'
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0A0A0A'
  },
  android: {
    backgroundColor: '#0A0A0A',
    allowMixedContent: true
  }
};

export default config;
