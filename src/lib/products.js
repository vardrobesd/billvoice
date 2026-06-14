import { supabase } from './supabase'

export async function getProducts(userId) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('id')

  return { data, error }
}

export async function addProduct(product) {
  const { error } = await supabase
    .from('products')
    .insert([product])

  return { error }
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  return { error }
}
export async function updateProduct(id, userId, updates) {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)

  return { error }
}
