import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useMobileNotifications = () => {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupPushNotifications = async () => {
      try {
        // Check permissions
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        setPermissionStatus(permStatus.receive);

        if (permStatus.receive !== 'granted') {
          console.log('Push notification permission not granted');
          return;
        }

        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success:', token.value);
          setPushToken(token.value);
          
          // Store token in database if user is logged in
          if (user) {
            storePushToken(token.value);
          }
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (err) => {
          console.error('Push registration error:', err.error);
        });

        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
          
          // Show local notification when app is in foreground
          LocalNotifications.schedule({
            notifications: [{
              id: Date.now(),
              title: notification.title || 'PHORI LAB',
              body: notification.body || '',
              extra: notification.data
            }]
          });
        });

        // Listen for notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action:', notification);
          // Handle notification tap - navigate to relevant screen
        });

      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    const setupLocalNotifications = async () => {
      try {
        const permStatus = await LocalNotifications.checkPermissions();
        
        if (permStatus.display === 'prompt') {
          await LocalNotifications.requestPermissions();
        }

        // Listen for local notification actions
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('Local notification action:', notification);
        });
      } catch (error) {
        console.error('Error setting up local notifications:', error);
      }
    };

    setupPushNotifications();
    setupLocalNotifications();

    return () => {
      PushNotifications.removeAllListeners();
      LocalNotifications.removeAllListeners();
    };
  }, [user]);

  const storePushToken = async (token: string) => {
    if (!user) return;

    try {
      // Store in profiles or a dedicated tokens table
      const { error } = await supabase
        .from('profiles')
        .update({ 
          // Note: You may need to add a push_token column
          // For now we'll just log it
        })
        .eq('user_id', user.id);

      if (error) {
        console.log('Push token storage skipped (no column yet)');
      }
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  };

  const showLocalNotification = async (title: string, body: string, data?: Record<string, unknown>) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title,
          body,
          extra: data
        }]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  };

  return {
    permissionStatus,
    pushToken,
    showLocalNotification,
    isNative: Capacitor.isNativePlatform()
  };
};
