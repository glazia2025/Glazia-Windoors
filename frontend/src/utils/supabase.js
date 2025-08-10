
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://kttdnoylgmnftrulhieg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dGRub3lsZ21uZnRydWxoaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTQ0MjEsImV4cCI6MjA3MDQzMDQyMX0.kFEwRkbWIINnYsUZAud-LCKHs2z54YEyChlJN4lvE1Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
        