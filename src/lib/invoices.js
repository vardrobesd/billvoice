import { supabase } from './supabase'

export async function getInvoices(userId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function addInvoice(invoice) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()

  return { data, error }
}

export async function updateInvoice(id, updates) {
  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', id)
    .select()

  return { data, error }
}

export async function deleteInvoice(id) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  return { error }
}

export async function addInvoiceItems(items) {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert(items)
    .select()

  return { data, error }
}

export async function getInvoiceItems(invoiceId) {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)

  return { data, error }
}