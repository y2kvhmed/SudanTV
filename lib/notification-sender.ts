// Server-side notification sender (for your backend)
export const sendPushNotifications = async (tokens: string[], title: string, body: string, data?: any) => {
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  }));

  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      console.log('Push notification result:', result);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
};

import { supabase } from './supabase';

// Function to notify all users about new content
export const notifyNewContent = async (contentTitle: string, contentType: string, contentId: string) => {
  try {
    // Get all push tokens from database
    const { data: tokens } = await supabase
      .from('notification_settings')
      .select('push_token')
      .eq('new_content', true)
      .not('push_token', 'is', null);

    if (tokens && tokens.length > 0) {
      const pushTokens = tokens.map(t => t.push_token);
      
      await sendPushNotifications(
        pushTokens,
        'New Content Added! 🎬',
        `${contentTitle} - New ${contentType} available now`,
        { contentId, type: 'new_content' }
      );
    }
  } catch (error) {
    console.error('Error notifying new content:', error);
  }
};