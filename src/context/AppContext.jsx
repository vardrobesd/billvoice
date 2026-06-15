import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { getProducts } from '../lib/products'
import { getCustomers } from '../lib/customers'
import { getInvoices, getInvoiceItems } from '../lib/invoices'
import { getBusiness } from '../lib/businesses'
const AppContext = createContext(null)

const STORAGE_KEY = 'jkhd_data'

// Seed data for the demo account
const seedData = {
  'demo@jkhd.com': {
    name: 'Javed Kumar',
    biz: 'BillVoice',
    email: 'demo@jkhd.com',
    pw: 'demo123',
    settings: {
      bname: 'BillVoice',
      gstin: '09AABCU9603R1ZX',
      addr1: 'Shop No. 12, Decor Market, Civil Lines',
      addr2: 'Moradabad, Uttar Pradesh – 244 001',
      phone: '+91 98765 43210',
      email: 'jk@homedecor.in',
      pos: 'Uttar Pradesh',
      cgst: '9',
      sgst: '9',
      prefix: 'INV',
      sig: ''
    },
    products: [
      { id: 1, name: 'Wooden Wall Clock', category: 'Clocks', price: 1299, stock: 8, desc: 'Handcrafted wooden clock' },
      { id: 2, name: 'Ceramic Vase (Set of 2)', category: 'Vases & Pots', price: 799, stock: 3, desc: '' },
      { id: 3, name: 'Boho Wall Hanging', category: 'Wall Decor', price: 549, stock: 0, desc: '' },
      { id: 4, name: 'LED Edison Bulb', category: 'Lighting', price: 349, stock: 22, desc: '' },
      { id: 5, name: 'Velvet Cushion Cover', category: 'Textiles', price: 299, stock: 15, desc: '' }
    ],
    customers: [
      { id: 1, name: 'Rahul Sharma', phone: '9876501234', email: 'rahul@gmail.com', addr1: '42 Ganga Vihar', addr2: 'Moradabad, UP – 244 001', gstin: '' },
      { id: 2, name: 'Priya Enterprises', phone: '9823456701', email: 'priya@biz.com', addr1: 'C-7 Industrial Area', addr2: 'Rampur, UP – 244 901', gstin: '09BBBCP1234F1ZX' }
    ],
    invoices: []
  }
}

function loadAllUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load data', e)
  }
  return seedData
}

function persistAllUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save data', e)
  }
}

export function AppProvider({ children }) {
  const [allUsers, setAllUsers] = useState(loadAllUsers)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentAuthUserId, setCurrentAuthUserId] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  // Persist whenever data changes
  useEffect(() => {
    persistAllUsers(allUsers)
  }, [allUsers])

  // Auto-hide toast
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 2400)
    return () => clearTimeout(t)
  }, [toastMsg])
  useEffect(() => {
    async function restoreSession() {
      const session = await getSession()

      if (!session?.user) {
        return
      }

      const email = session.user.email?.toLowerCase()
      const authUserId = session.user.id


      if (!allUsers[email]) {
        setAllUsers(prev => ({
          ...prev,
          [email]: {
            name: session.user.user_metadata?.full_name || 'User',
            biz: 'My Business',
            email,
            settings: {
              bname: 'My Business',
              gstin: '',
              addr1: '',
              addr2: '',
              phone: '',
              email: '',
              pos: '',
              cgst: '9',
              sgst: '9',
              prefix: 'INV',
              sig: ''
            },
            products: [],
            customers: [],
            invoices: []
          }
        }))
      }

      setCurrentUserId(email)
      setCurrentAuthUserId(authUserId)
      await loadProductsFromSupabase(session.user)
      await loadInvoicesFromSupabase(session.user)
      await loadCustomersFromSupabase(session.user)
      await loadBusinessFromSupabase(session.user)
    }

    restoreSession()
    
  }, [])
  async function loadBusinessFromSupabase(user) {
    if (!user?.id || !user?.email) return

    const { data, error } = await getBusiness(user.id)

    if (error || !data) return

    setAllUsers(prev => ({
      ...prev,
      [user.email.toLowerCase()]: {
        ...prev[user.email.toLowerCase()],
        settings: {
          ...prev[user.email.toLowerCase()].settings,

          bname: data.business_name || '',
          gstin: data.gstin || '',
          phone: data.phone || '',
          addr1: data.address || '',
          pos: data.state || '',

          email: data.email || '',
          cgst: data.cgst || '9',
          sgst: data.sgst || '9',
          prefix: data.prefix || 'INV',
          sig: data.sig || '',
          invoice_start_number: data.invoice_start_number || 1
        }
      }
    }))
  }
  async function loadProductsFromSupabase(user) {
    if (!user?.id || !user?.email) return

    const { data, error } = await getProducts(user.id)

    if (error) {
      console.error(error)
      return
    }

    setAllUsers(prev => ({
      ...prev,
      [user.email.toLowerCase()]: {
        ...prev[user.email.toLowerCase()],
        id: user.id,
        products: data || []
      }
    }))
  }
  async function loadInvoicesFromSupabase(user) {
    if (!user?.id || !user?.email) return

    const { data: invoices, error } = await getInvoices(user.id)

    if (error) {
      console.error(error)
      return
    }

    const { data: customers } = await getCustomers(user.id)

    const invoicesWithItems = await Promise.all(
      (invoices || []).map(async invoice => {
        const { data: items } = await getInvoiceItems(invoice.id)

        const customer = customers?.find(
          c => String(c.id) === String(invoice.customer_id)
        )

        return {
          ...invoice,

          custName: customer?.name || 'Unknown Customer',
          custAddr: customer?.address || '',
          custGstin: customer?.gstin || '',

          date: invoice.created_at
            ? new Date(invoice.created_at).toLocaleDateString('en-IN')
            : '',

          items: (items || []).map(item => ({
            name: item.product_name,
            qty: item.quantity,
            price: Number(item.price || 0),
            subtotal: Number(item.amount || 0)
          }))
        }
      })
    )

    setAllUsers(prev => ({
      ...prev,
      [user.email.toLowerCase()]: {
        ...prev[user.email.toLowerCase()],
        invoices: invoicesWithItems
      }
    }))
  }
  async function loadCustomersFromSupabase(user) {
    if (!user?.id || !user?.email) return

    const { data, error } = await getCustomers(user.id)

    if (error) {
      console.error(error)
      return
    }

    setAllUsers(prev => ({
      ...prev,
      [user.email.toLowerCase()]: {
        ...prev[user.email.toLowerCase()],
        customers: data || []
      }
    }))
  }

  const currentUser = currentUserId
    ? { ...allUsers[currentUserId], id: currentAuthUserId || allUsers[currentUserId]?.id }
    : null

  function showToast(msg) {
    setToastMsg(msg)
  }

  function login(email, password) {
    const uid = email.toLowerCase().trim()
    const user = allUsers[uid]
    if (!user || user.pw !== password) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    setCurrentUserId(uid)
    return { ok: true }
  }

  function register({ name, biz, email, pw }) {
    const uid = email.toLowerCase().trim()
    if (!name || !uid || !pw) return { ok: false, error: 'Please fill all fields.' }
    if (pw.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
    if (allUsers[uid]) return { ok: false, error: 'Email already registered.' }

    const newUser = {
      name,
      biz,
      email: uid,
      pw,
      settings: { bname: biz, gstin: '', addr1: '', addr2: '', phone: '', email: '', pos: '', cgst: '9', sgst: '9', prefix: 'INV', sig: '' },
      products: [],
      customers: [],
      invoices: []
    }
    setAllUsers(prev => ({ ...prev, [uid]: newUser }))
    return { ok: true }
  }

  function logout() {
    setCurrentUserId(null)
    setCurrentAuthUserId(null)
  }

  // Generic updater for the current user's data slice
  function updateUserData(updater) {
    if (!currentUserId) return
    setAllUsers(prev => {
      const user = prev[currentUserId]
      const updated = typeof updater === 'function' ? updater(user) : { ...user, ...updater }
      return { ...prev, [currentUserId]: updated }
    })
  }

  const value = {
    currentUser,
    currentUserId,
    login,
    register,
    logout,
    updateUserData,
    toastMsg,
    showToast
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
