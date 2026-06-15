import { jsPDF } from 'jspdf'
import { numberToWords } from './helpers'

// Generates and downloads a GST tax invoice PDF
export function generateInvoicePDF(invoice, settings) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const s = settings
  const prefix = s.prefix || 'INV'
  const invoiceNo = `${prefix}-${String(invoice.id).padStart(4, '0')}`

  const pageWidth = 210
  const leftMargin = 15
  const rightMargin = 15
  const tableWidth = pageWidth - leftMargin - rightMargin
  let y = 15

  // Top accent bar
  doc.setFillColor(24, 95, 165)
  doc.rect(0, 0, 210, 1.5, 'F')

  // Business name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(24, 95, 165)
  doc.text(s.bname || 'Business Name', leftMargin, y)
  y += 6

  // Supplier details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  if (s.addr1) { doc.text(s.addr1, leftMargin, y); y += 4.5 }
  if (s.addr2) { doc.text(s.addr2, leftMargin, y); y += 4.5 }
  if (s.phone || s.email) { doc.text('Ph: ' + (s.phone || '') + ' | ' + (s.email || ''), leftMargin, y); y += 4.5 }
  if (s.gstin) {
    doc.setFont('helvetica', 'bold')
    doc.text('GSTIN: ', leftMargin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(s.gstin, leftMargin + 12, y)
    y += 4.5
  }

  // TAX INVOICE label, right side
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(30, 30, 30)
  doc.text('TAX INVOICE', pageWidth - rightMargin, 15, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Invoice No: ' + invoiceNo, pageWidth - rightMargin, 22, { align: 'right' })
  doc.text('Date: ' + invoice.date, pageWidth - rightMargin, 26.5, { align: 'right' })
  doc.text('Place of supply: ' + (invoice.pos || s.pos || '—'), pageWidth - rightMargin, 31, { align: 'right' })

  // Divider
  y = Math.max(y, 35) + 3
  doc.setDrawColor(24, 95, 165)
  doc.setLineWidth(0.5)
  doc.line(leftMargin, y, pageWidth - rightMargin, y)
  y += 5

  // Bill-to box
  const billToHeight = s.gstin ? 22 : 18
  doc.setFillColor(240, 244, 249)
  doc.roundedRect(leftMargin, y, tableWidth, invoice.custGstin ? 26 : 22, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 30, 30)
  doc.text('Bill to:', leftMargin + 4, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  doc.text(invoice.custName, leftMargin + 4, y + 10)
  if (invoice.custAddr) doc.text(invoice.custAddr, leftMargin + 4, y + 14.5)
  if (invoice.custGstin) {
    doc.setFont('helvetica', 'bold')
    doc.text('GSTIN: ', leftMargin + 4, y + 19)
    doc.setFont('helvetica', 'normal')
    doc.text(invoice.custGstin, leftMargin + 18, y + 19)
  }
  y += invoice.custGstin ? 30 : 26

  // Items table header
  doc.setFillColor(24, 95, 165)
  doc.rect(leftMargin, y, tableWidth, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Item', leftMargin + 3, y + 4.8)
  doc.text('Qty', leftMargin + tableWidth * 0.58, y + 4.8, { align: 'center' })
  doc.text('Rate (Rs.)', leftMargin + tableWidth * 0.74, y + 4.8, { align: 'right' })
  doc.text('Taxable Value (Rs.)', leftMargin + tableWidth - 8, y + 4.8, { align: 'right' })
  y += 7

  // Items rows
  invoice.items.forEach((item, idx) => {
    const shade = idx % 2 === 0 ? 255 : 248
    doc.setFillColor(shade, shade, shade)
    doc.rect(leftMargin, y, tableWidth, 6.5, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    doc.text(item.name.substring(0, 38), leftMargin + 3, y + 4.4)
    doc.text(String(item.qty), leftMargin + tableWidth * 0.58, y + 4.4, { align: 'center' })
    doc.text('Rs.' + item.price.toFixed(2), leftMargin + tableWidth * 0.74, y + 4.4, { align: 'right' })
    doc.text('Rs.' + item.subtotal.toFixed(2), leftMargin + tableWidth - 8, y + 4.4, { align: 'right' })    
    y += 6.5
  })
  y += 4

  // Totals box
  const boxX = leftMargin + tableWidth * 0.58
  const boxW = tableWidth * 0.42
  

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(boxX, y, boxX + boxW - 4, y)
  y += 5

  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('Taxable value', boxX + 2, y)
  doc.text(`Rs.${Number(invoice.subtotal || 0).toFixed(2)}`, boxX + boxW-4 , y, { align: 'right' })
  y += 5

  doc.text(`CGST @ ${settings.cgst || 9}%`, boxX + 2, y)
  doc.text('Rs.' + (Number(invoice.gst_amount || 0) / 2).toFixed(2), boxX + boxW -4 , y, { align: 'right' })
  y += 5

  doc.text(`SGST @ ${settings.sgst || 9}%`, boxX + 2, y)
  doc.text('Rs.' + (Number(invoice.gst_amount || 0) / 2).toFixed(2), boxX + boxW-4 , y, { align: 'right' })
  y += 2

  doc.setDrawColor(24, 95, 165)
  doc.setLineWidth(0.5)
  doc.line(boxX, y, boxX + boxW - 4, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(24, 95, 165)
  doc.text('Total invoice value', boxX + 2, y)
  doc.text(`Rs.${Number(invoice.total || 0).toFixed(2)}`, boxX + boxW - 4, y, { align: 'right' })
  y += 8

  // Amount in words
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(leftMargin, y, pageWidth - rightMargin, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(50, 50, 50)
  doc.text('Amount in words: ', leftMargin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(numberToWords(Math.round(invoice.total)) + ' Rupees Only', leftMargin + 30, y)
  y += 22

  // Signature
  if (s.sig) {
    try {
      doc.addImage(s.sig, 'PNG', pageWidth - rightMargin - 40, y, 40, 16)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Authorised signatory', pageWidth - rightMargin, y + 20, { align: 'right' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(30, 30, 30)
      doc.text(s.bname || '', pageWidth - rightMargin, y + 25, { align: 'right' })
    } catch (e) {
      drawSignaturePlaceholder(doc, pageWidth, rightMargin, y)
    }
  } else {
    drawSignaturePlaceholder(doc, pageWidth, rightMargin, y)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your purchase!', pageWidth / 2, 285, { align: 'center' })

  doc.save(`${invoiceNo}.pdf`)
  return invoiceNo
}

function drawSignaturePlaceholder(doc, pageWidth, rightMargin, y) {
  doc.setDrawColor(150, 150, 150)
  doc.line(pageWidth - rightMargin - 40, y + 16, pageWidth - rightMargin, y + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Authorised signatory', pageWidth - rightMargin, y + 20, { align: 'right' })
}
