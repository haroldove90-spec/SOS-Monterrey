import { createClient } from '@supabase/supabase-js';

// Estas variables deben configurarse en el panel de Secrets de AI Studio
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://stdsrvvguvnuuqacvrbr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZHNydnZndXZudXVxYWN2cmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NjEwOTksImV4cCI6MjA5MDEzNzA5OX0.Yc5mbLp_Omk5x41bGZzHIebp2SnxwtlAwcMfu9k1QGA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
