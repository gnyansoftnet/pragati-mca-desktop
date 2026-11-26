import React from 'react'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'react-toastify'
import { MilkRejectionResponseDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

interface RejectionPdfButtonProps {
  item: MilkRejectionResponseDto
  user?: any
}

export const RejectionPdfButton: React.FC<RejectionPdfButtonProps> = ({ item, user }) => {
  const formatDateDDMMYYYY = (dateVal?: string | Date): string => {
    if (!dateVal) return ''
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return String(dateVal)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Exact data variables (Unchanged)
      const docNo = String(item.id ?? 1).padStart(4, '0')
      const docDate = formatDateDDMMYYYY(item.createdAt || new Date())
      const dskName = item.dskName || '-'
      const dskCode = item.dskCode || '-'
      const plantId = String(item.plant || user?.plant || '')
      const route = (item as any).routeName
        ? `${(item as any).routeName}${item.route ? `(${item.route})` : ''}`
        : item.route || '-'
      const supervisor = item.supervisor || '-'
      const shift = String(item.shiftName || (Number(item.shift) === 1 ? 'morning' : 'evening'))
      const cans = String(item.noOfCanes ?? (item as any).noOfCans ?? 0)
      const qty = `${Number(item.aproxQuantity || 0)} KG`
      const reason = item.reason || '-'
      const plantName = String(user?.plantName || '')
      const plantAddress = `${plantId}, ${plantName}`

      // Page Geometry matching print page (14mm left/right margins => 182mm content width)
      const startX = 14
      const pageWidth = 182 // 14mm to 196mm
      const centerX = 105

      // ==========================================
      // SECTION 1: TOP VENDOR REJECTION SLIP
      // ==========================================

      // 1. Header Box
      doc.setDrawColor(0)
      doc.setLineWidth(0.25)
      doc.rect(startX, 10, pageWidth, 17)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('Pragati Milk Products Private Limited', centerX, 15, { align: 'center' })

      doc.setFontSize(10.5)
      doc.text('Milk Chilling Plant', centerX, 20, { align: 'center' })

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text(plantAddress, centerX, 25, { align: 'center' })

      // 2. Metadata Box (60% / 40% split matching print page)
      doc.rect(startX, 29, pageWidth, 23)
      doc.line(123, 29, 123, 52) // Vertical divider

      // Left Column
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text('To', startX + 3, 33)

      const labelX = startX + 3
      const colonX = startX + 34
      const valueX = startX + 37

      // Row 1: DSK Code/ Name
      doc.text('DSK Code/ Name', labelX, 37.5)
      doc.text(':', colonX, 37.5)
      doc.text(`${dskCode}/ ${dskName}`, valueX, 37.5)

      // Row 2: Route Name
      doc.text('Route Name', labelX, 41.5)
      doc.text(':', colonX, 41.5)
      doc.text(`${route}`, valueX, 41.5)

      // Row 3: Plant Id
      doc.text('Plant Id', labelX, 45.5)
      doc.text(':', colonX, 45.5)
      doc.text(`${plantId}`, valueX, 45.5)

      // Row 4: Supervisor
      doc.text('Supervisor', labelX, 49.5)
      doc.text(':', colonX, 49.5)
      doc.text(`${supervisor}`, valueX, 49.5)

      // Right Column
      doc.text('Document No', 126, 37.5)
      doc.text(':', 152, 37.5)
      doc.text(`${docNo}`, 155, 37.5)

      doc.text('Document Date', 126, 42.5)
      doc.text(':', 152, 42.5)
      doc.text(`${docDate}`, 155, 42.5)

      // 3. Salutation & Notice Text
      doc.setFontSize(8.5)
      doc.text('Dear Sir/Madam', startX, 56.5)
      doc.text(
        'Milk supplied by you are rejected and returned you back. The details of return and rejection are as follows.',
        startX,
        60.5
      )

      // 4. Details Table (100% width, black header with white text)
      autoTable(doc, {
        startY: 63,
        margin: { left: startX, right: 14 },
        theme: 'plain',
        head: [['SL', 'Description', 'Result']],
        body: [
          ['01', 'Date', docDate],
          ['02', 'Shift', shift],
          ['03', 'No of Cans', cans],
          ['04', 'Aprox Quantity', qty],
          ['05', 'Reason of Rejection', reason]
        ],
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 68 },
          2: { cellWidth: 96 }
        }
      })

      const finalY1 = (doc as any).lastAutoTable.finalY || 89

      // 5. Disclaimer & Sign-off
      doc.setFontSize(8)
      doc.text(
        'Please note that for this return quantity, the cost of transportation and other incidental expenses will be debited to your account.',
        startX,
        finalY1 + 5
      )

      doc.text('You Faithfully', startX, finalY1 + 14)
      doc.setFont('helvetica', 'bold')
      doc.text('Manager, Milk Chilling Plant', startX, finalY1 + 19)

      // ==========================================
      // CUTTING LINE (DOTTED WITH SCISSORS BADGE)
      // ==========================================
      const cutY = finalY1 + 27

      doc.setLineDashPattern([2, 2], 0)
      doc.setDrawColor(0)
      doc.line(startX, cutY, startX + pageWidth, cutY)
      doc.setLineDashPattern([], 0)

      // White badge to cover dashed line matching print page
      doc.setFillColor(255, 255, 255)
      doc.rect(20, cutY - 2.5, 28, 5, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.text('✂ CUT HERE', 22, cutY + 1)

      // ==========================================
      // SECTION 2: MILK RETURN ACKNOWLEDGEMENT
      // ==========================================
      const ackStartY = cutY + 6

      // Acknowledgement Header Box (Centered)
      doc.setDrawColor(0)
      doc.rect(75, ackStartY, 60, 11)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.text('Milk Return', centerX, ackStartY + 4.5, { align: 'center' })
      doc.text('Acknowledgement', centerX, ackStartY + 9, { align: 'center' })

      // Metadata Box (Identical 60% / 40% split)
      const metaY2 = ackStartY + 14
      doc.rect(startX, metaY2, pageWidth, 23)
      doc.line(123, metaY2, 123, metaY2 + 23)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.text('To', startX + 3, metaY2 + 4)

      // Left Column
      doc.text('DSK Code/ Name', labelX, metaY2 + 8.5)
      doc.text(':', colonX, metaY2 + 8.5)
      doc.text(`${dskCode}/ ${dskName}`, valueX, metaY2 + 8.5)

      doc.text('Route Name', labelX, metaY2 + 12.5)
      doc.text(':', colonX, metaY2 + 12.5)
      doc.text(`${route}`, valueX, metaY2 + 12.5)

      doc.text('Plant Id', labelX, metaY2 + 16.5)
      doc.text(':', colonX, metaY2 + 16.5)
      doc.text(`${plantId}`, valueX, metaY2 + 16.5)

      doc.text('Supervisor', labelX, metaY2 + 20.5)
      doc.text(':', colonX, metaY2 + 20.5)
      doc.text(`${supervisor}`, valueX, metaY2 + 20.5)

      // Right Column
      doc.text('Document No', 126, metaY2 + 8.5)
      doc.text(':', 152, metaY2 + 8.5)
      doc.text(`${docNo}`, 155, metaY2 + 8.5)

      doc.text('Document Date', 126, metaY2 + 13.5)
      doc.text(':', 152, metaY2 + 13.5)
      doc.text(`${docDate}`, 155, metaY2 + 13.5)

      // Details Table (Identical to Top Table)
      autoTable(doc, {
        startY: metaY2 + 26,
        margin: { left: startX, right: 14 },
        theme: 'plain',
        head: [['SL', 'Description', 'Result']],
        body: [
          ['01', 'Date', docDate],
          ['02', 'Shift', shift],
          ['03', 'No of Cans', cans],
          ['04', 'Aprox Quantity', qty],
          ['05', 'Reason of Rejection', reason]
        ],
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 68 },
          2: { cellWidth: 96 }
        }
      })

      const finalY2 = (doc as any).lastAutoTable.finalY || 205

      // Signatures Box (50% / 50% split with right-aligned manager signature)
      const sigY = finalY2 + 4
      doc.rect(startX, sigY, pageWidth, 18)
      doc.line(centerX, sigY, centerX, sigY + 18) // Center divider

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.text('Received By', startX + 3, sigY + 5.5)

      // Right-aligned to match the print page (.sig-box-right)
      doc.text('Manager,', startX + pageWidth - 3, sigY + 5.5, { align: 'right' })
      doc.text('Milk Chilling Plant', startX + pageWidth - 3, sigY + 10, { align: 'right' })

      doc.save(`Rejection_Slip_${docNo}_${item.dskCode || 'DSK'}.pdf`)
      toast.success('Rejection PDF slip downloaded!')
    } catch (error: any) {
      console.error('Failed to generate rejection PDF:', error)
      toast.error('Failed to generate rejection PDF.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownloadPdf}
      title="Download PDF Slip"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 hover:border-rose-300 text-[11px] font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
    >
      <FileDown className="w-3.5 h-3.5 text-rose-600" />
    </button>
  )
}

export default RejectionPdfButton