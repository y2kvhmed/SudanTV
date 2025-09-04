-- Simple profile deletion - just delete the profile
-- RLS policies should handle the rest
DELETE FROM user_profiles WHERE id = 'profile_id_here' AND is_primary = false;