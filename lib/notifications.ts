import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  // Request notification permissions
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  // Get push token and save to database
  async registerForPushNotifications(profileId: string) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save token to database
      await supabase
        .from('notification_settings')
        .upsert({
          profile_id: profileId,
          push_token: token,
          new_content: true,
          new_episodes: true,
          recommendations: true
        }, {
          onConflict: 'profile_id'
        });

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  },

  // Update notification preferences
  async updatePreferences(profileId: string, preferences: {
    new_content?: boolean;
    new_episodes?: boolean;
    recommendations?: boolean;
  }) {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(preferences)
        .eq('profile_id', profileId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  },

  // Send notification to specific profile
  async sendNotification(profileId: string, title: string, body: string, data?: any) {
    try {
      const { error } = await supabase
        .from('notification_queue')
        .insert({
          profile_id: profileId,
          title,
          body,
          data: data ? JSON.stringify(data) : null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error queuing notification:', error);
    }
  },

  // Notify users about new episodes of their favorite shows
  async notifyNewEpisode(contentId: string, episodeTitle: string) {
    try {
      // Get users who have this content in their lists
      const { data: userLists } = await supabase
        .from('user_lists')
        .select(`
          profile_id,
          user_profiles (
            name,
            notification_settings (
              new_episodes,
              push_token
            )
          )
        `)
        .eq('content_id', contentId);

      if (!userLists) return;

      // Send notifications to users who want episode notifications
      for (const userList of userLists) {
        const settings = userList.user_profiles?.notification_settings;
        if (settings?.new_episodes) {
          await this.sendNotification(
            userList.profile_id,
            'New Episode Available!',
            `${episodeTitle} is now available to watch`,
            { contentId, type: 'new_episode' }
          );
        }
      }
    } catch (error) {
      console.error('Error notifying new episode:', error);
    }
  },

  // Notify users about new content
  async notifyNewContent(contentId: string, contentTitle: string, contentType: string) {
    try {
      // Get all users who want new content notifications
      const { data: users } = await supabase
        .from('notification_settings')
        .select('profile_id, push_token')
        .eq('new_content', true);

      if (!users) return;

      for (const user of users) {
        await this.sendNotification(
          user.profile_id,
          'New Content Added!',
          `${contentTitle} - New ${contentType} available now`,
          { contentId, type: 'new_content' }
        );
      }
    } catch (error) {
      console.error('Error notifying new content:', error);
    }
  },

  // Send personalized recommendations
  async sendRecommendations(profileId: string, recommendations: any[]) {
    try {
      if (recommendations.length === 0) return;

      const topRecommendation = recommendations[0];
      await this.sendNotification(
        profileId,
        'New Recommendation',
        `We think you'll love "${topRecommendation.title}"`,
        { contentId: topRecommendation.id, type: 'recommendation' }
      );
    } catch (error) {
      console.error('Error sending recommendations:', error);
    }
  },

  // Handle notification response (when user taps notification)
  handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'new_episode' || data?.type === 'new_content' || data?.type === 'recommendation') {
      // Navigate to content details
      return { screen: 'content', params: { id: data.contentId } };
    }
    
    return null;
  }
};