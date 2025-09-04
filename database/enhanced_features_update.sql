-- Enhanced Sudan TV Database Schema (Update Version)
-- Only create tables that don't exist

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

-- Update content_analytics if it exists, create if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_analytics') THEN
    CREATE TABLE content_analytics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      content_id UUID REFERENCES content(id) ON DELETE CASCADE,
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

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- User Profiles Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profiles') THEN
    CREATE POLICY "Users can view their own profiles" ON user_profiles
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profiles') THEN
    CREATE POLICY "Users can create their own profiles" ON user_profiles
      FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profiles') THEN
    CREATE POLICY "Users can update their own profiles" ON user_profiles
      FOR UPDATE USING (user_id = auth.uid());
  END IF;

  -- Watch Progress Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watch_progress' AND policyname = 'Users can view their own watch progress') THEN
    CREATE POLICY "Users can view their own watch progress" ON watch_progress
      FOR SELECT USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'watch_progress' AND policyname = 'Users can manage their own watch progress') THEN
    CREATE POLICY "Users can manage their own watch progress" ON watch_progress
      FOR ALL USING (profile_id IN (SELECT id FROM user_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_watch_progress_profile ON watch_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_content ON watch_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_profile ON content_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_profile ON user_preferences(profile_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_token ON shared_content(share_token);
CREATE INDEX IF NOT EXISTS idx_notification_queue_profile ON notification_queue(profile_id);