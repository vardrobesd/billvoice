import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nigovmgbqxmcweejmedo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZ292bWdicXhtY3dlZWptZWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MDQ5NTcsImV4cCI6MjA5Njk4MDk1N30.CNb_QNVqx-8m6Mc56vJbuWMB9swTjbRz7LxS5ICOTao'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)