import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const emptyForm = { name: '', phone: '', email: '', addr1: '', addr2: '', gstin: '' }

export default function Customers() {
  const { currentUser, updateUserData, showToast } = useApp()
  const { customers, invoices } = currentUser

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search)
  )

  function invoiceCount(custId) {
    return invoices.filter(i => i.custId === custId).length
  }

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(c) {
    setEditingId(c.id)
    setForm({ name: c.name, phone: c.phone || '', email: c.email || '', addr1: c.addr1 || '', addr2: c.addr2 || '', gstin: c.gstin || '' })
    setModalOpen(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      alert('Enter customer name.')
      return
    }

    updateUserData(user => {
      let newCustomers
      if (editingId) {
        newCustomers = user.customers.map(c => c.id === editingId ? { ...c, ...form, name } : c)
      } else {
        const nextId = Math.max(100, ...user.customers.map(c => c.id), 99) + 1
        newCustomers = [...user.customers, { id: nextId, ...form, name }]
      }
      return { ...user, customers: newCustomers }
    })

    showToast(editingId ? 'Customer updated!' : 'Customer added!')
    setModalOpen(false)
  }

  function handleDelete(id) {
    if (!confirm('Delete this customer?')) return
    updateUserData(user => ({ ...user, customers: user.customers.filter(c => c.id !== id) }))
    showToast('Deleted.')
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Customers</div>
        <button className="btn primary" onClick={openAdd}>
          <i className="ti ti-plus" /> Add customer
        </button>
      </div>

      <div className="card" style={{ padding: '10px 14px' }}>
        <input className="search-input" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card no-padding">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Address</th><th>GSTIN</th><th>Invoices</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No customers yet.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td style={{ fontSize: 11.5, maxWidth: 160 }}>{[c.addr1, c.addr2].filter(Boolean).join(', ') || '—'}</td>
                  <td>{c.gstin || '—'}</td>
                  <td>{invoiceCount(c.id)}</td>
                  <td>
                    <button className="btn xs" onClick={() => openEdit(c)}><i className="ti ti-edit" /></button>{' '}
                    <button className="btn xs danger" onClick={() => handleDelete(c.id)}><i className="ti ti-trash" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="modal narrow">
            <div className="modal-title">{editingId ? 'Edit customer' : 'Add customer'}</div>
            <form onSubmit={handleSave}>
              <div className="form-row cols-2">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address line 1</label>
                <input value={form.addr1} onChange={e => setForm({ ...form, addr1: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address line 2 (city, state, PIN)</label>
                <input value={form.addr2} onChange={e => setForm({ ...form, addr2: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN (optional)</label>
                <input value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} placeholder="Leave blank if unregistered" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
