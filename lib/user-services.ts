import { supabase } from './supabase';

export interface UserList {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_id: string;
  episode_id?: string;
  progress_seconds: number;
  duration_seconds: number;
  last_watched: string;
}

export const userListService = {
  async addToList(contentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          content_id: contentId
        });

      return !error;
    } catch (error) {
      console.error('Error adding to list:', error);
      return false;
    }
  },

  async removeFromList(contentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);

      return !error;
    } catch (error) {
      console.error('Error removing from list:', error);
      return false;
    }
  },

  async isInList(contentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  },

  async getUserList(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_lists')
        .select(`
          *,
          content (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return data?.map(item => item.content) || [];
    } catch (error) {
      console.error('Error getting user list:', error);
      return [];
    }
  }
};

export const watchHistoryService = {
  async updateWatchHistory(
    contentId: string, 
    progressSeconds: number, 
    durationSeconds: number,
    episodeId?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          episode_id: episodeId,
          progress_seconds: progressSeconds,
          duration_seconds: durationSeconds,
          last_watched: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error updating watch history:', error);
      return false;
    }
  },

  async getContinueWatching(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('watch_history')
        .select(`
          *,
          content (*),
          episodes (*)
        `)
        .eq('user_id', user.id)
        .gt('progress_seconds', 0)
        .lt('progress_seconds', 'duration_seconds')
        .order('last_watched', { ascending: false })
        .limit(10);

      return data || [];
    } catch (error) {
      console.error('Error getting continue watching:', error);
      return [];
    }
  },

  async getWatchProgress(contentId: string, episodeId?: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const query = supabase
        .from('watch_history')
        .select('progress_seconds')
        .eq('user_id', user.id)
        .eq('content_id', contentId);

      if (episodeId) {
        query.eq('episode_id', episodeId);
      }

      const { data, error } = await query.single();

      return data?.progress_seconds || 0;
    } catch (error) {
      return 0;
    }
  }
};