import { supabase } from './supabase'

export async function getCustomers(userId) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')

  return { data, error }
}

export async function addCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()

  return { data, error }
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()

  return { data, error }
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  return { error }
}
