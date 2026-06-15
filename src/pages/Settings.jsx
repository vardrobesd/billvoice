import React, { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { saveBusiness } from '../lib/businesses'


export default function Settings() {
  const { currentUser, updateUserData, showToast } = useApp()
  const [form, setForm] = useState({ ...currentUser.settings })
  const fileInputRef = useRef(null)

  function handleChange(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSave(e) {
    e.preventDefault()

    const settingsData = {
      ...form,
      cgst: form.cgst || '9',
      sgst: form.sgst || '9',
      prefix: form.prefix || 'INV'
    }

    updateUserData(user => ({
      ...user,
      settings: settingsData
    }))
    console.log(settingsData)
    const { error } = await saveBusiness({
      user_id: currentUser.id,
      business_name: settingsData.bname,
      gstin: settingsData.gstin,
      phone: settingsData.phone,
      address: `${settingsData.addr1 || ''} ${settingsData.addr2 || ''}`.trim(),
      state: settingsData.pos,
      email: settingsData.email,
      cgst: settingsData.cgst,
      sgst: settingsData.sgst,
      prefix: settingsData.prefix,
      sig: settingsData.sig
    })

    if (error) {
      console.error(error)
      showToast('Database save failed')
      return
    }

    showToast('Settings saved!')
  }

  function handleSignatureUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const sigData = ev.target.result
      setForm({ ...form, sig: sigData })
      updateUserData(user => ({ ...user, settings: { ...user.settings, sig: sigData } }))
      showToast('Signature uploaded!')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Business settings</div>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Supplier / business details</div>
        <form onSubmit={handleSave}>
          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Business name</label>
              <input value={form.bname || ''} onChange={e => handleChange('bname', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input value={form.gstin || ''} onChange={e => handleChange('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address line 1</label>
            <input value={form.addr1 || ''} onChange={e => handleChange('addr1', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Address line 2 (city, state, PIN)</label>
            <input value={form.addr2 || ''} onChange={e => handleChange('addr2', e.target.value)} />
          </div>

          <div className="form-row cols-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input value={form.email || ''} onChange={e => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Place of supply (state)</label>
            <input value={form.pos || ''} onChange={e => handleChange('pos', e.target.value)} />
          </div>

          <div className="divider" />

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>GST rates</div>
          <div className="form-row cols-3">
            <div className="form-group">
              <label className="form-label">CGST rate (%)</label>
              <input type="number" value={form.cgst || ''} onChange={e => handleChange('cgst', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">SGST rate (%)</label>
              <input type="number" value={form.sgst || ''} onChange={e => handleChange('sgst', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice prefix</label>
              <input value={form.prefix || ''} onChange={e => handleChange('prefix', e.target.value)} />
            </div>
          </div>

          <div className="divider" />

          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Authorised signature</div>
          <div className="sig-box" onClick={() => fileInputRef.current.click()}>
            {form.sig ? (
              <img src={form.sig} alt="Signature" className="sig-preview" />
            ) : (
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <i className="ti ti-upload" style={{ fontSize: 20, display: 'block', margin: '0 auto 4px' }} />
                Click to upload signature (PNG / JPG)
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleSignatureUpload} />

          <div style={{ marginTop: 14 }}>
            <button type="submit" className="btn primary"><i className="ti ti-check" /> Save settings</button>
          </div>
        </form>
      </div>
    </div>
  )
}
