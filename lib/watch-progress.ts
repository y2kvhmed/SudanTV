import { supabase } from './supabase';

export interface WatchProgress {
  id: string;
  profile_id: string;
  content_id: string;
  episode_id?: string;
  progress_seconds: number;
  duration_seconds: number;
  completed: boolean;
  last_watched: string;
}

export const watchProgressService = {
  // Save watch progress
  async saveProgress(
    profileId: string,
    contentId: string,
    progressSeconds: number,
    durationSeconds: number,
    episodeId?: string
  ) {
    try {
      const completed = progressSeconds >= durationSeconds * 0.9; // 90% completion
      
      const { error } = await supabase
        .from('watch_progress')
        .upsert({
          profile_id: profileId,
          content_id: contentId,
          episode_id: episodeId,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          completed,
          last_watched: new Date().toISOString()
        }, {
          onConflict: 'profile_id,content_id,episode_id'
        });

      if (error) throw error;

      // Track view for analytics
      await supabase
        .from('content_views')
        .insert({
          profile_id: profileId,
          content_id: contentId,
          episode_id: episodeId,
          view_duration: progressSeconds,
          completed_view: completed
        });

    } catch (error) {
      console.error('Error saving watch progress:', error);
    }
  },

  // Get watch progress for content
  async getProgress(profileId: string, contentId: string, episodeId?: string) {
    try {
      let query = supabase
        .from('watch_progress')
        .select('*')
        .eq('profile_id', profileId)
        .eq('content_id', contentId);

      if (episodeId) {
        query = query.eq('episode_id', episodeId);
      } else {
        query = query.is('episode_id', null);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting watch progress:', error);
      return null;
    }
  },

  // Get continue watching list
  async getContinueWatching(profileId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('watch_progress')
        .select(`
          *,
          content (
            id,
            title,
            poster_url,
            type,
            genre
          )
        `)
        .eq('profile_id', profileId)
        .eq('completed', false)
        .gt('progress_seconds', 30) // At least 30 seconds watched
        .order('last_watched', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting continue watching:', error);
      return [];
    }
  },

  // Get recommendations based on viewing history
  async getRecommendations(profileId: string, limit = 20) {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('genre, preference_score')
        .eq('profile_id', profileId)
        .order('preference_score', { ascending: false });

      if (!preferences || preferences.length === 0) {
        // Return popular content if no preferences
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      }

      // Get content based on preferred genres
      const topGenres = preferences.slice(0, 3).map(p => p.genre);
      
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('genre', topGenres)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  // Mark content as completed
  async markCompleted(profileId: string, contentId: string, episodeId?: string) {
    try {
      const { error } = await supabase
        .from('watch_progress')
        .upsert({
          profile_id: profileId,
          content_id: contentId,
          episode_id: episodeId,
          completed: true,
          last_watched: new Date().toISOString()
        }, {
          onConflict: 'profile_id,content_id,episode_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  }
};