import React from 'react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { initials } from '../utils/helpers'

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { currentUser, logout } = useApp()

  return (
    <div className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
      
      <div className="brand">
        <div className="brand-name">BillVoice</div>
        <div className="brand-sub">Smart Billing & Inventory</div>
      </div>

      <div className="user-pill">
        <div className="avatar">
          {initials(
            currentUser?.settings?.bname ||
            currentUser?.name ||
            'User'
          )}
        </div>

        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div className="user-name">
            {currentUser?.settings?.bname ||
              currentUser?.name ||
              'User'}
          </div>

          <div className="user-email">
            {currentUser?.email || ''}
          </div>
        </div>
      </div>

      <div className="nav-section">Main</div>
      <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} end>
        <i className="ti ti-layout-dashboard" /> Dashboard
      </NavLink>
      <NavLink to="/products" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-sofa" /> Products
      </NavLink>
      <NavLink to="/inventory" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-box" /> Inventory
      </NavLink>

      <div className="nav-section">Sales</div>
      <NavLink to="/invoices" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-receipt" /> Invoices
      </NavLink>
      <NavLink to="/customers" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-users" /> Customers
      </NavLink>
      <NavLink to="/reports" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-chart-bar" /> Sales reports
      </NavLink>

      <div className="nav-section">Account</div>
      <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <i className="ti ti-settings" /> Business settings
      </NavLink>

      <div className="nav-logout">
        <button className="btn sm" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
          <i className="ti ti-logout" /> Sign out
        </button>
      </div>
    </div>
  )
}
