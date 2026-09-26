module.exports = {
  setNotificationHandler: () => {},
  getPermissionsAsync: async () => ({ granted: true }),
  requestPermissionsAsync: async () => ({ granted: true }),
  cancelAllScheduledNotificationsAsync: async () => {},
  scheduleNotificationAsync: async () => 'mock_notification_id',
  SchedulableTriggerInputTypes: {
    DAILY: 'daily',
  },
  IosAuthorizationStatus: {
    PROVISIONAL: 3,
  },
};
