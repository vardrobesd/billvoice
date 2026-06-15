import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { stockStatus, formatINR } from '../utils/helpers'
import { getCurrentUser } from '../lib/auth'

import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct
} from '../lib/products'



const emptyForm = {
  name: '',
  price: '',
  stock: '',
  desc: ''
}



export default function Products() {
  const { currentUser, updateUserData, showToast } = useApp()
  const products = currentUser?.products || []

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      desc: product.desc || ''
    })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    const name = form.name.trim()
    const price = parseFloat(form.price)
    const stock = parseInt(form.stock, 10)

    if (!name || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
      alert('Please fill all fields with valid values.')
      return
    }

    setSaving(true)
    setSaveError('')

    try {
      const authUser = await getCurrentUser()

      if (!authUser?.id) {
        throw new Error('Please sign in again before saving products.')
      }

      if (editingId) {
        const { error } = await updateProduct(editingId, authUser.id, {
          name,

          price,
          stock
        })

        if (error) throw error
      } else {
        const { error } = await addProduct({
          user_id: authUser.id,
          name,

          price,
          stock
        })

        if (error) throw error
      }

      const { data: savedProducts, error: reloadError } = await getProducts(authUser.id)

      if (reloadError) {
        throw reloadError
      }

      updateUserData(user => ({
        ...user,
        id: authUser.id,
        products: savedProducts || []
      }))

      showToast(editingId ? 'Product updated!' : 'Product added!')
      setModalOpen(false)
    } catch (error) {
      console.error(error)
      setSaveError(error.message || 'Could not save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return

    const { error } = await deleteProduct(id)

    if (error) {
      console.error(error)
      return
    }

    updateUserData(user => ({
      ...user,
      products: user.products.filter(p => p.id !== id)
    }))

    showToast('Product deleted.')
  }
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Products</div>
        <button className="btn primary" onClick={openAdd}>
          <i className="ti ti-plus" /> Add product
        </button>
      </div>

      <div className="card" style={{ padding: '10px 14px' }}>
        <input className="search-input" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card no-padding">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No products found.</td></tr>
            ) : (
              filtered.map(p => {
                const status = stockStatus(p.stock)
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{formatINR(p.price)}</td>
                    <td style={p.stock <= 5 ? { color: 'var(--color-danger)', fontWeight: 600 } : {}}>{p.stock}</td>
                    <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>{' '}

                      <button
                        className="btn danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal narrow">
            <div className="modal-title">{editingId ? 'Edit product' : 'Add product'}</div>
            <form onSubmit={handleSave}>
              <div className="form-row cols-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                </div>
                
              </div>
              <div className="form-row cols-2">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock qty</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={2} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </div>
              {saveError && <div className="error-text">{saveError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
