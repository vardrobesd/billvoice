// Convert a number to Indian-style words (for "Amount in words" on invoices)
export function numberToWords(num) {
  if (num === 0) return 'Zero'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigits(n) {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '')
  }

  let result = ''
  let n = num

  if (n >= 10000000) { result += twoDigits(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000 }
  if (n >= 100000) { result += twoDigits(Math.floor(n / 100000)) + ' Lakh '; n %= 100000 }
  if (n >= 1000) { result += twoDigits(Math.floor(n / 1000)) + ' Thousand '; n %= 1000 }
  if (n > 0) result += twoDigits(n)

  return result.trim()
}

// Stock status badge config
export function stockStatus(stock) {
  if (stock === 0) return { label: 'Out of stock', cls: 'red' }
  if (stock <= 5) return { label: 'Low stock', cls: 'amber' }
  return { label: 'In stock', cls: 'green' }
}

// Format currency in Indian style (₹1,23,456)
export function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

// Today's date in "DD Mon YYYY" format
export function todayDate() {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Generate initials from a full name (e.g. "Javed Kumar" -> "JK")
export function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
