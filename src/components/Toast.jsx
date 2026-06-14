import React from 'react'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toastMsg } = useApp()

  if (!toastMsg) return null

  return (
    <div className="toast">
      <i className="ti ti-check" /> {toastMsg}
    </div>
  )
}
