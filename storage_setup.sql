-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true) ON CONFLICT DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-images');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'content-images');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'content-images');