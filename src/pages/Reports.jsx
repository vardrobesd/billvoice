import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../context/AppContext'
import { formatINR } from '../utils/helpers'

export default function Reports() {
  const { currentUser } = useApp()
  const { invoices } = currentUser

  const revenue = invoices.reduce((sum, i) => sum + i.total, 0)
  const totalGst = invoices.reduce((sum, i) => sum + i.cg + i.sg, 0)
  const avgInvoice = invoices.length ? revenue / invoices.length : 0

  // Revenue by month
  const monthlyData = useMemo(() => {
    const map = {}
    invoices.forEach(inv => {
      const parts = inv.date.split(' ')
      const key = (parts[1] || '') + (parts[2] ? "'" + parts[2].slice(-2) : '')
      map[key] = (map[key] || 0) + inv.total
    })
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }))
  }, [invoices])

  // Top products by revenue
  const productData = useMemo(() => {
    const map = {}
    invoices.forEach(inv => inv.items.forEach(it => {
      map[it.name] = (map[it.name] || 0) + it.subtotal
    }))
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
  }, [invoices])

  // Top customers by revenue
  const customerData = useMemo(() => {
    const map = {}
    invoices.forEach(inv => {
      if (!map[inv.custName]) map[inv.custName] = { name: inv.custName, count: 0, revenue: 0 }
      map[inv.custName].count++
      map[inv.custName].revenue += inv.total
    })
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
  }, [invoices])

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sales reports</div>
      </div>

      <div className="stat-grid cols-4">
        <div className="stat-card">
          <div className="stat-label">Total revenue</div>
          <div className="stat-value green">{formatINR(Math.round(revenue))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total GST</div>
          <div className="stat-value">{formatINR(Math.round(totalGst))}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invoices</div>
          <div className="stat-value">{invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg invoice</div>
          <div className="stat-value">{formatINR(Math.round(avgInvoice))}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Revenue by month</div>
          <div className="chart-wrap">
            {monthlyData.length === 0 ? (
              <div className="empty-state">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={v => formatINR(v)} />
                  <Bar dataKey="value" fill="#185FA5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Top products</div>
          <div className="chart-wrap">
            {productData.length === 0 ? (
              <div className="empty-state">No data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip formatter={v => formatINR(v)} />
                  <Bar dataKey="value" fill="#1D9E75" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Top customers</div>
        {customerData.length === 0 ? (
          <div className="empty-state">Create invoices to see reports.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Customer</th><th>Invoices</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {customerData.map(c => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.count}</td>
                  <td>{formatINR(Math.round(c.revenue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
