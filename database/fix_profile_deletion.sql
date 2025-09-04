-- Enable cascading deletes for profile-related tables
ALTER TABLE watch_progress DROP CONSTRAINT IF EXISTS watch_progress_profile_id_fkey;
ALTER TABLE watch_progress ADD CONSTRAINT watch_progress_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE content_views DROP CONSTRAINT IF EXISTS content_views_profile_id_fkey;
ALTER TABLE content_views ADD CONSTRAINT content_views_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_profile_id_fkey;
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE notification_settings DROP CONSTRAINT IF EXISTS notification_settings_profile_id_fkey;
ALTER TABLE notification_settings ADD CONSTRAINT notification_settings_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE user_lists DROP CONSTRAINT IF EXISTS user_lists_profile_id_fkey;
ALTER TABLE user_lists ADD CONSTRAINT user_lists_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE;