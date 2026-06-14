import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthPage() {
  const { login, register, showToast } = useApp()
  const [tab, setTab] = useState('login')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [loginErr, setLoginErr] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regBiz, setRegBiz] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPw, setRegPw] = useState('')
  const [regErr, setRegErr] = useState('')

  function handleLogin(e) {
    e.preventDefault()
    const result = login(loginEmail, loginPw)
    if (!result.ok) {
      setLoginErr(result.error)
    }
  }

  function handleRegister(e) {
    e.preventDefault()
    const result = register({ name: regName, biz: regBiz, email: regEmail, pw: regPw })
    if (!result.ok) {
      setRegErr(result.error)
      return
    }
    showToast('Account created! Sign in to continue.')
    setTab('login')
    setLoginEmail(regEmail)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>BillVoice</div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              marginTop: 4
            }}
          >
            Smart Billing & Inventory
          </div>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>
            Sign in
          </div>
          <div className={`auth-tab${tab === 'reg' ? ' active' : ''}`} onClick={() => setTab('reg')}>
            Create account
          </div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)} placeholder="••••••••" />
            </div>
            {loginErr && <div className="error-text">{loginErr}</div>}
            <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign in
            </button>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 12 }}>
              Demo: demo@jkhd.com / demo123
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Business name</label>
                <input value={regBiz} onChange={e => setRegBiz(e.target.value)} placeholder="BillVoice" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password (min 6 characters)</label>
              <input type="password" value={regPw} onChange={e => setRegPw(e.target.value)} />
            </div>
            {regErr && <div className="error-text">{regErr}</div>}
            <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
              Create account
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
