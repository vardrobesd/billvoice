import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatINR, todayDate } from '../utils/helpers'
import { generateInvoicePDF } from '../utils/pdfGenerator'
import InvoiceDocument from '../components/InvoiceDocument'

export default function Invoices() {
  const { currentUser, updateUserData, showToast } = useApp()
  const { invoices, customers, products, settings } = currentUser

  const [createOpen, setCreateOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // Create-invoice form state
  const [custId, setCustId] = useState('')
  const [custAddr, setCustAddr] = useState('')
  const [pos, setPos] = useState('')
  const [items, setItems] = useState([])

  function openCreate() {
    setCustId('')
    setCustAddr('')
    setPos(settings.pos || '')
    setItems([])
    setCreateOpen(true)
  }

  function handleCustChange(id) {
    setCustId(id)
    const c = customers.find(x => x.id === parseInt(id, 10))
    setCustAddr(c ? [c.addr1, c.addr2].filter(Boolean).join(', ') : '')
  }

  function addItem() {
    setItems([...items, { pid: products[0]?.id || null, qty: 1 }])
  }

  function updateItem(idx, key, value) {
    setItems(items.map((it, i) => i === idx ? { ...it, [key]: value } : it))
  }

  function removeItem(idx) {
    setItems(items.filter((_, i) => i !== idx))
  }

  // Calculate running totals for the create form
  const cgstRate = parseFloat(settings.cgst || 9)
  const sgstRate = parseFloat(settings.sgst || 9)
  const taxableValue = items.reduce((sum, it) => {
    const p = products.find(x => x.id === it.pid)
    return sum + (p?.price || 0) * it.qty
  }, 0)
  const cgstAmount = taxableValue * cgstRate / 100
  const sgstAmount = taxableValue * sgstRate / 100
  const grandTotal = taxableValue + cgstAmount + sgstAmount

  function handleCreateInvoice(e) {
    e.preventDefault()
    if (!custId) { alert('Select a customer.'); return }
    if (items.length === 0) { alert('Add at least one item.'); return }

    const customer = customers.find(c => c.id === parseInt(custId, 10))
    const invoiceItems = items.map(it => {
      const p = products.find(x => x.id === it.pid)
      return { name: p?.name || '', price: p?.price || 0, qty: it.qty, subtotal: (p?.price || 0) * it.qty }
    })
    const tax = invoiceItems.reduce((sum, it) => sum + it.subtotal, 0)
    const cg = tax * cgstRate / 100
    const sg = tax * sgstRate / 100

    updateUserData(user => {
      const nextId = Math.max(100, ...user.invoices.map(i => i.id), 99) + 1
      const newInvoice = {
        id: nextId,
        custId: customer.id,
        custName: customer.name,
        custAddr,
        custGstin: customer.gstin || '',
        pos,
        items: invoiceItems,
        tax,
        cr: cgstRate,
        sr: sgstRate,
        cg,
        sg,
        total: tax + cg + sg,
        date: todayDate()
      }
      return { ...user, invoices: [...user.invoices, newInvoice] }
    })

    showToast('Invoice created!')
    setCreateOpen(false)
  }

  async function handleDownloadPDF() {
    if (!viewingInvoice) return
    setPdfGenerating(true)
    try {
      const invoiceNo = generateInvoicePDF(viewingInvoice, settings)
      showToast('PDF downloaded: ' + invoiceNo + '.pdf')
    } catch (err) {
      console.error(err)
      showToast('PDF error: ' + err.message)
    }
    setPdfGenerating(false)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Invoices</div>
        <button className="btn primary" onClick={openCreate}>
          <i className="ti ti-plus" /> New invoice
        </button>
      </div>

      <div className="card no-padding">
        <table>
          <thead>
            <tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Taxable</th><th>GST</th><th>Total</th><th></th></tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No invoices yet.</td></tr>
            ) : (
              [...invoices].reverse().map(inv => (
                <tr key={inv.id}>
                  <td style={{ fontWeight: 600 }}>{settings.prefix || 'INV'}-{String(inv.id).padStart(4, '0')}</td>
                  <td>{inv.custName}</td>
                  <td>{inv.date}</td>
                  <td>{formatINR(inv.tax)}</td>
                  <td>{formatINR((inv.cg + inv.sg).toFixed(2))}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(inv.total.toFixed(2))}</td>
                  <td>
                    <button className="btn xs" onClick={() => setViewingInvoice(inv)}><i className="ti ti-eye" /> View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE INVOICE MODAL */}
      {createOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCreateOpen(false) }}>
          <div className="modal wide">
            <div className="modal-title">Create GST invoice</div>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-row cols-2">
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select value={custId} onChange={e => handleCustChange(e.target.value)}>
                    <option value="">— select customer —</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Place of supply</label>
                  <input value={pos} onChange={e => setPos(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Customer address</label>
                <input value={custAddr} onChange={e => setCustAddr(e.target.value)} />
              </div>

              <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 7 }}>
                Items
              </div>

              {items.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>No items yet. Add one below.</div>
              ) : (
                items.map((it, idx) => {
                  const p = products.find(x => x.id === it.pid)
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 7 }}>
                      <select style={{ flex: 2 }} value={it.pid || ''} onChange={e => updateItem(idx, 'pid', parseInt(e.target.value, 10))}>
                        {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name} (₹{pr.price})</option>)}
                      </select>
                      <input type="number" min="1" value={it.qty} style={{ width: 58, flexShrink: 0 }}
                        onChange={e => updateItem(idx, 'qty', parseInt(e.target.value, 10) || 1)} />
                      <span style={{ minWidth: 70, fontSize: 12.5, fontWeight: 600 }}>
                        {formatINR(((p?.price || 0) * it.qty))}
                      </span>
                      <button type="button" className="btn xs" onClick={() => removeItem(idx)}><i className="ti ti-x" /></button>
                    </div>
                  )
                })
              )}

              <button type="button" className="btn sm" onClick={addItem} style={{ marginBottom: 10 }}>
                <i className="ti ti-plus" /> Add item
              </button>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right', fontSize: 12.5, lineHeight: 1.9 }}>
                  <div>Taxable value: <span style={{ fontWeight: 600 }}>{formatINR(taxableValue)}</span></div>
                  <div>CGST ({cgstRate}%): {formatINR(cgstAmount.toFixed(2))}</div>
                  <div>SGST ({sgstRate}%): {formatINR(sgstAmount.toFixed(2))}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>Total: {formatINR(grandTotal.toFixed(2))}</div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setCreateOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Create invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / PDF MODAL */}
      {viewingInvoice && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewingInvoice(null) }}>
          <div className="modal wide">
            <InvoiceDocument invoice={viewingInvoice} settings={settings} />
            <div className="modal-actions">
              <button className="btn" onClick={() => setViewingInvoice(null)}>Close</button>
              <button className="btn primary" onClick={handleDownloadPDF} disabled={pdfGenerating}>
                <i className="ti ti-download" /> {pdfGenerating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
