-- SudanTV Production Database Schema
-- Complete setup for enterprise-grade streaming platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enhanced user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium', 'family')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  country TEXT DEFAULT 'SD',
  date_of_birth DATE,
  parental_controls BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  watch_preferences JSONB DEFAULT '{"autoplay": true, "quality": "auto", "subtitles": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories and genres
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE genres (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#FFFAE5',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced content table
CREATE TABLE content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  poster_url TEXT NOT NULL,
  backdrop_url TEXT,
  trailer_url TEXT,
  video_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'documentary', 'youtube', 'live')),
  category_id UUID REFERENCES categories(id),
  duration_minutes INTEGER,
  release_date DATE,
  year INTEGER,
  rating DECIMAL(3,1) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  imdb_id TEXT,
  tmdb_id TEXT,
  language TEXT DEFAULT 'ar',
  country TEXT DEFAULT 'SD',
  director TEXT,
  cast_members TEXT[],
  production_company TEXT,
  budget BIGINT,
  revenue BIGINT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_kids_friendly BOOLEAN DEFAULT TRUE,
  slug TEXT UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  view_count BIGINT DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content genres junction
CREATE TABLE content_genres (
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, genre_id)
);

-- Series structure
CREATE TABLE series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE UNIQUE,
  total_seasons INTEGER DEFAULT 1,
  total_episodes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  next_episode_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE seasons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  poster_url TEXT,
  episode_count INTEGER DEFAULT 0,
  release_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, season_number)
);

CREATE TABLE episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER,
  air_date DATE,
  view_count BIGINT DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0.0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

-- User interactions
CREATE TABLE user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE TABLE user_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE TABLE watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info JSONB,
  UNIQUE(user_id, content_id, episode_id)
);

CREATE TABLE user_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  download_url TEXT NOT NULL,
  file_size BIGINT,
  quality TEXT DEFAULT 'medium',
  expires_at TIMESTAMP WITH TIME ZONE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, episode_id)
);

-- Collections
CREATE TABLE collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  poster_url TEXT,
  type TEXT DEFAULT 'curated' CHECK (type IN ('curated', 'auto', 'user')),
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE collection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, content_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  message TEXT NOT NULL,
  message_ar TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promotion')),
  action_url TEXT,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Analytics
CREATE TABLE content_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'play', 'pause', 'complete', 'share', 'like', 'download')),
  session_id UUID,
  device_info JSONB,
  location_info JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE app_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  properties JSONB,
  session_id UUID,
  device_info JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin tables
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'content_manager')),
  permissions JSONB DEFAULT '{}',
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'copyright', 'spam', 'violence', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can view published content" ON content FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage content" ON content FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Admins can manage episodes" ON episodes FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ratings" ON user_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watch history" ON watch_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own downloads" ON user_downloads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON content_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own app analytics" ON app_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_type, subscription_expires_at);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_featured ON content(is_featured) WHERE is_featured = true;
CREATE INDEX idx_content_trending ON content(is_trending) WHERE is_trending = true;
CREATE INDEX idx_content_new_release ON content(is_new_release) WHERE is_new_release = true;
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_year ON content(year);
CREATE INDEX idx_content_rating ON content(rating);
CREATE INDEX idx_content_view_count ON content(view_count);
CREATE INDEX idx_content_search ON content USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_content_search_ar ON content USING gin(to_tsvector('arabic', COALESCE(title_ar, title) || ' ' || COALESCE(description_ar, description, '')));
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content ON user_favorites(content_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(user_id, last_watched_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_timestamp ON content_analytics(timestamp);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User registration handler with admin check
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  
  -- Auto-create admin for bedaya.sdn@gmail.com
  IF LOWER(NEW.email) = 'bedaya.sdn@gmail.com' THEN
    INSERT INTO admin_users (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Content rating updater
CREATE OR REPLACE FUNCTION update_content_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content SET
    rating = (SELECT AVG(rating)::DECIMAL(3,1) FROM user_ratings WHERE content_id = NEW.content_id),
    rating_count = (SELECT COUNT(*) FROM user_ratings WHERE content_id = NEW.content_id)
  WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_insert AFTER INSERT ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();
CREATE TRIGGER update_rating_after_update AFTER UPDATE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();
CREATE TRIGGER update_rating_after_delete AFTER DELETE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();

-- Initial data setup
INSERT INTO categories (name, name_ar, slug, description, sort_order) VALUES
('Movies', 'أفلام', 'movies', 'Feature films and cinema', 1),
('Series', 'مسلسلات', 'series', 'TV series and shows', 2),
('Documentaries', 'وثائقيات', 'documentaries', 'Documentary films and series', 3),
('Kids', 'أطفال', 'kids', 'Content for children', 4),
('News', 'أخبار', 'news', 'News and current affairs', 5),
('Sports', 'رياضة', 'sports', 'Sports content', 6),
('Music', 'موسيقى', 'music', 'Music videos and concerts', 7);

INSERT INTO genres (name, name_ar, slug, color) VALUES
('Drama', 'دراما', 'drama', '#FF6B6B'),
('Comedy', 'كوميديا', 'comedy', '#4ECDC4'),
('Action', 'أكشن', 'action', '#45B7D1'),
('Romance', 'رومانسي', 'romance', '#F7DC6F'),
('Thriller', 'إثارة', 'thriller', '#BB8FCE'),
('Horror', 'رعب', 'horror', '#EC7063'),
('Documentary', 'وثائقي', 'documentary', '#58D68D'),
('Animation', 'رسوم متحركة', 'animation', '#F8C471'),
('Crime', 'جريمة', 'crime', '#85929E'),
('History', 'تاريخي', 'history', '#D7BDE2');

INSERT INTO collections (name, name_ar, description, type, is_featured, sort_order) VALUES
('Trending Now', 'الأكثر رواجاً', 'Most popular content right now', 'auto', true, 1),
('New Releases', 'الإصدارات الجديدة', 'Latest additions to our catalog', 'auto', true, 2),
('Sudanese Spotlight', 'الضوء السوداني', 'Best of Sudanese cinema and TV', 'curated', true, 3),
('Critics Choice', 'اختيار النقاد', 'Highly rated by critics', 'curated', true, 4),
('Hidden Gems', 'الكنوز المخفية', 'Underrated masterpieces', 'curated', false, 5);g', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can view published content" ON content FOR SELECT USING (status = 'published');
CREATE POLICY "Anyone can view episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ratings" ON user_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watch history" ON watch_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own downloads" ON user_downloads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON content_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert own app analytics" ON app_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_type, subscription_expires_at);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_featured ON content(is_featured) WHERE is_featured = true;
CREATE INDEX idx_content_trending ON content(is_trending) WHERE is_trending = true;
CREATE INDEX idx_content_new_release ON content(is_new_release) WHERE is_new_release = true;
CREATE INDEX idx_content_category ON content(category_id);
CREATE INDEX idx_content_year ON content(year);
CREATE INDEX idx_content_rating ON content(rating);
CREATE INDEX idx_content_view_count ON content(view_count);
CREATE INDEX idx_content_search ON content USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_content_search_ar ON content USING gin(to_tsvector('arabic', COALESCE(title_ar, title) || ' ' || COALESCE(description_ar, description, '')));
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content ON user_favorites(content_id);
CREATE INDEX idx_watch_history_user ON watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(user_id, last_watched_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_timestamp ON content_analytics(timestamp);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User registration handler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Content rating updater
CREATE OR REPLACE FUNCTION update_content_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content SET
    rating = (SELECT AVG(rating)::DECIMAL(3,1) FROM user_ratings WHERE content_id = NEW.content_id),
    rating_count = (SELECT COUNT(*) FROM user_ratings WHERE content_id = NEW.content_id)
  WHERE id = NEW.content_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_after_insert AFTER INSERT ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();
CREATE TRIGGER update_rating_after_update AFTER UPDATE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();
CREATE TRIGGER update_rating_after_delete AFTER DELETE ON user_ratings FOR EACH ROW EXECUTE FUNCTION update_content_rating();

-- Initial data setup
INSERT INTO categories (name, name_ar, slug, description, sort_order) VALUES
('Movies', 'أفلام', 'movies', 'Feature films and cinema', 1),
('Series', 'مسلسلات', 'series', 'TV series and shows', 2),
('Documentaries', 'وثائقيات', 'documentaries', 'Documentary films and series', 3),
('Kids', 'أطفال', 'kids', 'Content for children', 4),
('News', 'أخبار', 'news', 'News and current affairs', 5),
('Sports', 'رياضة', 'sports', 'Sports content', 6),
('Music', 'موسيقى', 'music', 'Music videos and concerts', 7);

INSERT INTO genres (name, name_ar, slug, color) VALUES
('Drama', 'دراما', 'drama', '#FF6B6B'),
('Comedy', 'كوميديا', 'comedy', '#4ECDC4'),
('Action', 'أكشن', 'action', '#45B7D1'),
('Romance', 'رومانسي', 'romance', '#F7DC6F'),
('Thriller', 'إثارة', 'thriller', '#BB8FCE'),
('Horror', 'رعب', 'horror', '#EC7063'),
('Documentary', 'وثائقي', 'documentary', '#58D68D'),
('Animation', 'رسوم متحركة', 'animation', '#F8C471'),
('Crime', 'جريمة', 'crime', '#85929E'),
('History', 'تاريخي', 'history', '#D7BDE2');

INSERT INTO collections (name, name_ar, description, type, is_featured, sort_order) VALUES
('Trending Now', 'الأكثر رواجاً', 'Most popular content right now', 'auto', true, 1),
('New Releases', 'الإصدارات الجديدة', 'Latest additions to our catalog', 'auto', true, 2),
('Sudanese Spotlight', 'الضوء السوداني', 'Best of Sudanese cinema and TV', 'curated', true, 3),
('Critics Choice', 'اختيار النقاد', 'Highly rated by critics', 'curated', true, 4),
('Hidden Gems', 'الكنوز المخفية', 'Underrated masterpieces', 'curated', false, 5);