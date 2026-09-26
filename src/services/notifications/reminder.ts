import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ReminderConfig } from '../../types';

let notificationsModule: any = null;
let isHandlerSet = false;

async function getNotifications() {
  if (Platform.OS === 'web') return null;

  // Expo SDK 53+ removed remote/push notifications in Expo Go on Android.
  // Checking executionEnvironment prevents crashing when previewing in Expo Go.
  const isExpoGoAndroid =
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGoAndroid) {
    return null;
  }

  if (notificationsModule) return notificationsModule;

  try {
    const mod = await import('expo-notifications');
    notificationsModule = mod;

    if (!isHandlerSet && notificationsModule.setNotificationHandler) {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isHandlerSet = true;
    }

    return notificationsModule;
  } catch (e) {
    console.warn('Local notifications are unavailable in this environment:', e);
    return null;
  }
}

const REMINDER_NOTIFICATION_CATEGORY = 'daily_expense_reminder';

export const notificationService = {
  /**
   * Request permission for local notifications.
   * Returns true if granted.
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const notifications = await getNotifications();
    if (!notifications) {
      // Graceful fallback for Expo Go Android
      return false;
    }

    try {
      const settings = await notifications.getPermissionsAsync();
      if (
        settings.granted ||
        settings.ios?.status === notifications.IosAuthorizationStatus?.PROVISIONAL
      ) {
        return true;
      }

      const request = await notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: false,
        },
      });

      return Boolean(
        request.granted ||
          request.ios?.status === notifications.IosAuthorizationStatus?.PROVISIONAL
      );
    } catch (e) {
      console.warn('Error requesting notification permissions:', e);
      return false;
    }
  },

  /**
   * Schedule the daily reminder at specified hour and minute.
   */
  async scheduleDailyReminder(config: ReminderConfig): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    const notifications = await getNotifications();
    if (!notifications) {
      // In Expo Go on Android, gracefully succeed so settings persist without throwing errors
      return true;
    }

    try {
      await this.cancelReminder();

      if (!config.enabled) {
        return true;
      }

      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return false;
      }

      await notifications.scheduleNotificationAsync({
        content: {
          title: 'Broke?',
          body: "Did you record today's expenses?",
          data: { screen: 'expense' },
          categoryIdentifier: REMINDER_NOTIFICATION_CATEGORY,
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.DAILY,
          hour: config.hour,
          minute: config.minute,
        },
      });

      return true;
    } catch (error) {
      console.warn('Failed to schedule daily reminder notification:', error);
      return false;
    }
  },

  /**
   * Cancel all scheduled reminders.
   */
  async cancelReminder(): Promise<void> {
    if (Platform.OS === 'web') return;

    const notifications = await getNotifications();
    if (!notifications) return;

    try {
      await notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.warn('Failed to cancel notifications:', e);
    }
  },

  /**
   * Send an immediate test notification (fires in 2 seconds) to verify permissions & notification rendering.
   */
  async sendTestNotificationNow(): Promise<{ success: boolean; isSimulated?: boolean; message?: string }> {
    if (Platform.OS === 'web') {
      return { success: true, isSimulated: true, message: 'Web does not support native notifications' };
    }

    const notifications = await getNotifications();
    if (!notifications) {
      return {
        success: true,
        isSimulated: true,
        message: 'Expo Go on Android disables notification sandbox modules (SDK 53+). Daily reminders will fire natively in your standalone APK build.',
      };
    }

    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return { success: false, message: 'Notification permission was not granted by device.' };
      }

      await notifications.scheduleNotificationAsync({
        content: {
          title: 'Broke?',
          body: "Did you record today's expenses?",
          data: { screen: 'expense' },
          categoryIdentifier: REMINDER_NOTIFICATION_CATEGORY,
        },
        trigger: {
          type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      return { success: true, message: 'Test reminder scheduled! Check your notification bar in 2 seconds.' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to trigger test notification' };
    }
  },
};
