import React, { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const STORAGE_KEY = 'jkhd_data'

// Seed data for the demo account
const seedData = {
  'demo@jkhd.com': {
    name: 'Javed Kumar',
    biz: 'JK Home Decor',
    email: 'demo@jkhd.com',
    pw: 'demo123',
    settings: {
      bname: 'JK Home Decor',
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

  const currentUser = currentUserId ? allUsers[currentUserId] : null

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
