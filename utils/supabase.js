const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://awledjmhuolixrqkttzm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3bGVkam1odW9saXhycWt0dHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2NjU4NTQsImV4cCI6MjA0NzI0MTg1NH0.dlvul9HqNt61ttUzpc9ia2gwzZR7N4d-6qco42523nE'

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = { supabase }