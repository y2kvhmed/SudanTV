import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cacsviyjlyzeyjufjtju.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhY3N2aXlqbHl6ZXlqdWZqdGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDc1NzIsImV4cCI6MjA3MjMyMzU3Mn0.Px9z1lSbIDoq4aBwjaNAs7QedIHWxZn6RnULubL_hwM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);