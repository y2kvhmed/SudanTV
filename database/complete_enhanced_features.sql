-- Complete Enhanced Sudan TV Database Schema
-- User Profiles System
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_child BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch Progress Tracking
CREATE TABLE IF NOT EXISTS watch_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, content_id, episode_id)
);

-- Content Analytics
CREATE TABLE IF NOT EXISTS content_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  view_duration INTEGER DEFAULT 0,
  completed_view BOOLEAN DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences for Recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  genre VARCHAR(50) NOT NULL,
  preference_score FLOAT DEFAULT 1.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, genre)
);

-- Push Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  new_content BOOLEAN DEFAULT true,
  new_episodes BOOLEAN DEFAULT true,
  recommendations BOOLEAN DEFAULT true,
  push_token TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Sharing
CREATE TABLE IF NOT EXISTS shared_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  share_token VARCHAR(50) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Performance Analytics
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_analytics') THEN
    CREATE TABLE content_analytics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      content_id UUID REFERENCES content(id) ON DELETE CASCADE UNIQUE,
      total_views INTEGER DEFAULT 0,
      unique_viewers INTEGER DEFAULT 0,
      average_watch_time FLOAT DEFAULT 0,
      completion_rate FLOAT DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Notification Queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own profiles" ON user_profiles;
CREATE POLICY "Users can view their own profiles" ON user_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own profiles" ON user_profiles;
CREATE POLICY "Users can create their own profiles" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profiles" ON user_profiles;
CREATE POLICY "Users can update their own profiles" ON user_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own watch progress" ON watch_progress;
CREATE POLICY "Users can view their own watch progress" ON watch_progress FOR SELECT USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own watch progress" ON watch_progress;
CREATE POLICY "Users can manage their own watch progress" ON watch_progress FOR ALL USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own content views" ON content_views;
CREATE POLICY "Users can view their own content views" ON content_views FOR SELECT USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can create their own content views" ON content_views;
CREATE POLICY "Users can create their own content views" ON content_views FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
CREATE POLICY "Users can manage their own preferences" ON user_preferences FOR ALL USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own notification settings" ON notification_settings;
CREATE POLICY "Users can manage their own notification settings" ON notification_settings FOR ALL USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can view shared content" ON shared_content;
CREATE POLICY "Anyone can view shared content" ON shared_content FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());

DROP POLICY IF EXISTS "Users can create shared content" ON shared_content;
CREATE POLICY "Users can create shared content" ON shared_content FOR INSERT WITH CHECK (shared_by IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own notifications" ON notification_queue;
CREATE POLICY "Users can view their own notifications" ON notification_queue FOR SELECT USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));

-- Analytics Functions
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_analytics (content_id, total_views, unique_viewers, average_watch_time, completion_rate)
  VALUES (NEW.content_id, 1, 1, NEW.view_duration, CASE WHEN NEW.completed_view THEN 1.0 ELSE 0.0 END)
  ON CONFLICT (content_id) DO UPDATE SET
    total_views = content_analytics.total_views + 1,
    unique_viewers = (SELECT COUNT(DISTINCT profile_id) FROM content_views WHERE content_id = NEW.content_id),
    average_watch_time = (SELECT AVG(view_duration) FROM content_views WHERE content_id = NEW.content_id),
    completion_rate = (SELECT COUNT(*) FILTER (WHERE completed_view) * 1.0 / COUNT(*) FROM content_views WHERE content_id = NEW.content_id),
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_analytics_trigger ON content_views;
CREATE TRIGGER update_analytics_trigger AFTER INSERT ON content_views FOR EACH ROW EXECUTE FUNCTION update_content_analytics();

-- User Preferences Function
CREATE OR REPLACE FUNCTION update_user_preferences()
RETURNS TRIGGER AS $$
DECLARE
  content_genre VARCHAR(50);
BEGIN
  SELECT genre INTO content_genre FROM content WHERE id = NEW.content_id;
  
  IF content_genre IS NOT NULL THEN
    INSERT INTO user_preferences (profile_id, genre, preference_score)
    VALUES (NEW.profile_id, content_genre, 1.0)
    ON CONFLICT (profile_id, genre) DO UPDATE SET
      preference_score = user_preferences.preference_score + 0.1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_preferences_trigger ON content_views;
CREATE TRIGGER update_preferences_trigger AFTER INSERT ON content_views FOR EACH ROW EXECUTE FUNCTION update_user_preferences();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watch_progress_profile ON watch_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_content ON watch_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_profile ON content_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile ON user_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_token ON shared_content(share_token);
CREATE INDEX IF NOT EXISTS idx_notification_queue_profile ON notification_queue(profile_id);