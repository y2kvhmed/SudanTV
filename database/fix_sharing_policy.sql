-- Fix shared content RLS policy
DROP POLICY IF EXISTS "Users can create shared content" ON shared_content;
CREATE POLICY "Users can create shared content" ON shared_content
  FOR INSERT WITH CHECK (true);