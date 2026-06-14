import React from 'react'
import { useApp } from '../context/AppContext'
import { stockStatus, formatINR } from '../utils/helpers'

export default function Dashboard() {
  const { currentUser } = useApp()
  const products = currentUser?.products || []

  const invoices = currentUser?.invoices || []
  const settings = currentUser?.settings || {}

  const lowStock = products.filter(p => p.stock <= 5)
  const revenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const recentInvoices = [...invoices].slice(-4).reverse()
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{today}</span>
      </div>

      <div className="stat-grid cols-4">
        <div className="stat-card">
          <div className="stat-label">Total products</div>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low stock</div>
          <div className="stat-value red">{lowStock.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoices</div>
          <div className="stat-value">{invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value green">{formatINR(Math.round(revenue))}</div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gap: 14
        }}
      >
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Low stock alerts</div>
          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: 16 }}>All good — no low stock items.</div>
          ) : (
            lowStock.map(p => {
              const status = stockStatus(p.stock)
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                  <span>{p.name}</span>
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                </div>
              )
            })
          )}
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent invoices</div>
          {recentInvoices.length === 0 ? (
            <div className="empty-state" style={{ padding: 16 }}>No invoices yet.</div>
          ) : (
            recentInvoices.map(inv => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{settings.prefix || 'INV'}-{String(inv.id).padStart(4, '0')}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{inv.custName}</span>
                <span style={{ fontWeight: 600 }}>{formatINR(Math.round(inv.total))}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
