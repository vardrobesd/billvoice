import React from 'react'
import { useApp } from '../context/AppContext'
import { stockStatus } from '../utils/helpers'

export default function Inventory() {
  const { currentUser, updateUserData, showToast } = useApp()
  const { products } = currentUser

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const outCount = products.filter(p => p.stock === 0).length

  function adjustStock(id, delta) {
    updateUserData(user => ({
      ...user,
      products: user.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    }))
    showToast('Stock updated.')
  }

  function setStock(id, currentStock, name) {
    const input = prompt(`Set stock for ${name}:`, currentStock)
    if (input === null) return
    const n = parseInt(input, 10)
    if (isNaN(n) || n < 0) return
    updateUserData(user => ({
      ...user,
      products: user.products.map(p => p.id === id ? { ...p, stock: n } : p)
    }))
    showToast('Stock set.')
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Inventory</div>
      </div>

      <div className="stat-grid cols-3">
        <div className="stat-card">
          <div className="stat-label">Total in stock</div>
          <div className="stat-value">{totalStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low stock (≤5)</div>
          <div className="stat-value red">{lowCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Out of stock</div>
          <div className="stat-value red">{outCount}</div>
        </div>
      </div>

      <div className="card no-padding">
        <table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Stock</th><th>Status</th><th>Adjust</th></tr>
          </thead>
          <tbody>
            {products.map(p => {
              const status = stockStatus(p.stock)
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="badge blue">{p.category}</span></td>
                  <td style={p.stock <= 5 ? { color: 'var(--color-danger)', fontWeight: 600 } : {}}>{p.stock}</td>
                  <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                  <td>
                    <button className="btn xs" onClick={() => adjustStock(p.id, -1)}><i className="ti ti-minus" /></button>{' '}
                    <button className="btn xs" onClick={() => adjustStock(p.id, 1)}><i className="ti ti-plus" /></button>{' '}
                    <button className="btn xs" onClick={() => setStock(p.id, p.stock, p.name)}><i className="ti ti-edit" /> Set</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
