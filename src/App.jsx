import React, { useState } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Invoices from './pages/Invoices'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function AppRoutes() {
  const { currentUser } = useApp()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <div className="app-shell">
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="main-content">
        <div className="mobile-topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>

          <span className="mobile-title">BillVoice</span>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  )
}
