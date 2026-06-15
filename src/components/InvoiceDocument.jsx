import React from 'react'
import { numberToWords } from '../utils/helpers'

// Renders the printable GST invoice layout.
// Used inside the "view invoice" modal and matches the PDF output structure.
export default function InvoiceDocument({ invoice, settings }) {
  const prefix = settings.prefix || 'INV'
  const invoiceNo =
    `${prefix}-${String(invoice.invoice_number).padStart(3, '0')}`
  console.log(invoice)

  return (
    <div className="invoice-doc">
      <div className="invoice-header-row">
        <div>
          <div className="invoice-biz-name">{settings.bname || 'Business Name'}</div>
          <div className="invoice-biz-details">
            {settings.addr1}<br />
            {settings.addr2}<br />
            Ph: {settings.phone} | {settings.email}<br />
            <b>GSTIN:</b> {settings.gstin || '—'}
          </div>
        </div>
        <div className="invoice-meta-box">
          <div className="invoice-tax-label">TAX INVOICE</div>
          <div className="invoice-meta-lines">
            <b>Invoice No:</b> {invoiceNo}<br />
            <b>Date:</b> {
              invoice.created_at
                ? new Date(invoice.created_at).toLocaleDateString('en-IN')
                : '—'
            }<br />
            <b>Place of supply:</b> {invoice.pos || settings.pos || '—'}
          </div>
        </div>
      </div>

      <div className="bill-to-box">
        <b>Bill to:</b><br />
        {invoice.custName || '—'}<br />
        {invoice.custAddr || '—'}
        {invoice.custGstin && <><br /><b>GSTIN:</b> {invoice.custGstin}</>}
      </div>

      <table className="invoice-items-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Item</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Rate (₹)</th>
            <th style={{ textAlign: 'right' }}>Taxable value (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 ? '#f8f8f8' : '#fff' }}>
              <td>{item.name}</td>
              <td style={{ textAlign: 'center' }}>{item.qty}</td>
              <td style={{ textAlign: 'right' }}>{item.price.toLocaleString('en-IN')}</td>
              <td style={{ textAlign: 'right' }}>{item.subtotal.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <table className="invoice-totals-table">
          <tbody>
            <tr>
              <td>Taxable value</td>
              <td style={{ textAlign: 'right' }}>
                ₹{Number(invoice.subtotal || 0).toLocaleString('en-IN')}
              </td>
            </tr>

            <tr>
              <td>CGST</td>
              <td style={{ textAlign: 'right' }}>
                ₹{(Number(invoice.gst_amount || 0) / 2).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>SGST</td>
              <td style={{ textAlign: 'right' }}>
                ₹{(Number(invoice.gst_amount || 0) / 2).toFixed(2)}
              </td>
            </tr>

            <tr
              className="total-row"
              style={{ borderTop: '1.5px solid var(--color-primary)' }}
            >
              <td style={{ paddingTop: 6 }}>Total invoice value</td>
              <td style={{ textAlign: 'right', paddingTop: 6 }}>
                ₹{Number(invoice.total || 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="invoice-footer-row">
        <div>
          <b>Amount in words:</b><br />
          {numberToWords(Math.round(Number(invoice.total || 0)))} Rupees Only
        </div>
        {settings.sig ? (
          <div style={{ marginTop: 18, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>Authorised signatory</div>
            <img src={settings.sig} alt="Signature" className="signature-img" />
            <div style={{ fontSize: 11, marginTop: 3, fontWeight: 600 }}>{settings.bname}</div>
          </div>
        ) : (
          <div style={{ marginTop: 28, borderTop: '1px solid #bbb', paddingTop: 4, width: 130, fontSize: 11, color: '#666' }}>
            Authorised signatory
          </div>
        )}
      </div>
    </div>
  )
}
