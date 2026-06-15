import { supabase } from './supabase'

export async function getBusiness(userId) {
  return await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function saveBusiness(data) {
  return await supabase
    .from('businesses')
    .upsert(data, { onConflict: 'user_id' })
}