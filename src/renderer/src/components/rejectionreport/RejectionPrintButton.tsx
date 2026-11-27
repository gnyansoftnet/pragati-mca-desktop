import React from 'react'
import { Printer } from 'lucide-react'
import { MilkRejectionResponseDto } from '@shared/dtos/milk-collection/milk-rejection.dto'

interface RejectionPrintButtonProps {
  item: MilkRejectionResponseDto
  user?: any
}

export const RejectionPrintButton: React.FC<RejectionPrintButtonProps> = ({ item, user }) => {
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

  const handlePrint = () => {
    const docNo = String(item.id ?? 1).padStart(4, '0')
    const docDate = formatDateDDMMYYYY(item.createdAt || new Date())
    const dskName = item.dskName || '-'
    const dskCode = item.dskCode || '-'
    const plantId = String(item.plant || user?.plant || '')
    const route = (item as any).routeName
    //   ? `${(item as any).routeName}${item.route ? `(${item.route})` : ''}`
    //   : item.route || '-'
    const supervisor = item.supervisor || '-'
    const shift = String(item.shiftName || (Number(item.shift) === 1 ? 'morning' : 'evening'))
    const cans = String(item.noOfCanes ?? (item as any).noOfCans ?? 0)
    const qty = `${Number(item.aproxQuantity || 0)} KG`
    const reason = item.reason || '-'
    const plantName = String(user?.plantName || '')
    const plantAddress = `${plantId}, ${plantName}`

    // 1. Clean up any previous print container or styles
    const oldPrintArea = document.getElementById('rejection-direct-print-area')
    if (oldPrintArea) oldPrintArea.remove()
    const oldStyle = document.getElementById('rejection-print-styles')
    if (oldStyle) oldStyle.remove()

    // 2. Inject print CSS: Hides slip on screen; on print, hides app UI & prints ONLY the slip
    const style = document.createElement('style')
    style.id = 'rejection-print-styles'
    style.innerHTML = `
      @media screen {
        #rejection-direct-print-area {
          display: none !important;
        }
      }
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm 14mm;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
        }
        /* Hide entire app interface when printing */
        body > *:not(#rejection-direct-print-area) {
          display: none !important;
        }
        /* Show ONLY the rejection slip on paper */
        body > #rejection-direct-print-area {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          z-index: 9999999 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #rejection-direct-print-area * {
          box-sizing: border-box;
          font-family: Arial, Helvetica, sans-serif;
          color: #000 !important;
        }
        .header-box {
          border: 1px solid #000;
          padding: 4px 7px;
          text-align: center;
          margin-bottom: 8px;
        }
        .header-box h2 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .header-box h3 {
          margin: 2px 0;
          font-size: 14px;
          font-weight: bold;
        }
        .header-box p {
          margin: 0;
          font-size: 12px;
        }
        .meta-box {
          border: 1px solid #000;
          display: flex;
          margin-bottom: 10px;
        }
        .meta-left {
          width: 60%;
          padding: 4px 7px;
          border-right: 1px solid #000;
        }
        .meta-right {
          width: 40%;
          padding: 4px 7px;
        }
        .row-line {
          display: flex;
          margin-bottom: 2px;
          font-size: 13px;
        }
        .lbl {
          width: 115px;
          display: inline-block;
        }
        .lbl-right {
          width: 105px;
          display: inline-block;
        }
        .notice-text {
          margin: 8px 0;
          font-size: 14px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          margin-bottom: 10px;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #000;
          padding: 2px 5px;
          font-size: 13px;
        }
        table.data-table th {
          background-color: #fff !important;
          color: #000 !important;
          text-align: left;
          font-weight: bold;
        }
          table.data-table th td {
          color: #000 !important;
        }
        table.data-table th.center, table.data-table td.center {
          text-align: center;
        }
        .disclaimer {
          font-size: 14px;
          margin-top: 10px;
        }
        .signoff {
          margin-top: 18px;
          font-size: 14px;
        }
        .cut-line-wrapper {
          margin: 50px 0;
          border-top: 1.5px dashed #000;
          position: relative;
        }
        .cut-badge {
          position: absolute;
          top: -9px;
          left: 20px;
          background: #fff;
          padding: 0 8px;
          font-size: 9px;
          letter-spacing: 2px;
        }
        .ack-header {
          width: 350px;
          margin: 0 auto 8px auto;
          border: 1px solid #000;
          text-align: center;
          padding: 4px;
          font-weight: bold;
          font-size: 18px;
        }
        .ack-signatures {
          border: 1px solid #000;
          display: flex;
          height: 55px;
          margin-top: 10px;
        }
        .sig-box-left {
          width: 50%;
          padding: 4px 7px;
          border-right: 1px solid #000;
        }
        .sig-box-right {
          width: 50%;
          padding: 4px 7px;
          text-align: right;
        }
      }
    `
    document.head.appendChild(style)

    // 3. Create the direct DOM container inside body
    const printContainer = document.createElement('div')
    printContainer.id = 'rejection-direct-print-area'
    printContainer.innerHTML = `
      <!-- TOP SECTION: VENDOR COPY -->
      <div>
        <div class="header-box">
          <h2>Pragati Milk Products Private Limited</h2>
          <h3>Milk Chilling Plant</h3>
          <p>${plantAddress}</p>
        </div>

        <div class="meta-box">
          <div class="meta-left">
            <div style="margin-bottom: 3px; font-size:13px;">To</div>
            <div class="row-line"><span class="lbl">DSK Code/ Name</span>: ${dskCode}/ ${dskName}</div>
            <div class="row-line"><span class="lbl">Route Name</span>: ${route}</div>
            <div class="row-line"><span class="lbl">Plant Id</span>: ${plantId}</div>
            <div class="row-line"><span class="lbl">Supervisor</span>: ${supervisor}</div>
          </div>
          <div class="meta-right">
            <div class="row-line"><span class="lbl-right">Document No</span>: ${docNo}</div>
            <div class="row-line"><span class="lbl-right">Document Date</span>: ${docDate}</div>
          </div>
        </div>

        <div class="notice-text">
          <div>Dear Sir/Madam</div>
          <div>Milk supplied by you are rejected and returned you back. The details of return and rejection are as follows.</div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="center" style="width: 10%;">SL</th>
              <th style="width: 38%;">Description</th>
              <th style="width: 52%;">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="center">01</td>
              <td>Date</td>
              <td>${docDate}</td>
            </tr>
            <tr>
              <td class="center">02</td>
              <td>Shift</td>
              <td>${shift}</td>
            </tr>
            <tr>
              <td class="center">03</td>
              <td>No of Cans</td>
              <td>${cans}</td>
            </tr>
            <tr>
              <td class="center">04</td>
              <td>Aprox Quantity</td>
              <td>${qty}</td>
            </tr>
            <tr>
              <td class="center">05</td>
              <td>Reason of Rejection</td>
              <td>${reason}</td>
            </tr>
          </tbody>
        </table>

        <div class="disclaimer">
          Please note that for this return quantity, the cost of transportation and other incidental expenses will be debited to your account.
        </div>

        <div class="signoff">
          <div>You Faithfully</div>
          <div style="font-weight: bold; margin-top: 3px;">Manager, Milk Chilling Plant</div>
        </div>
      </div>

      <!-- CUTTING LINE -->
      <div class="cut-line-wrapper">
        <span class="cut-badge">&#9986; CUT HERE</span>
      </div>

      <!-- BOTTOM SECTION: MILK RETURN ACKNOWLEDGEMENT -->
      <div>
        <div class="ack-header">
          <div>Milk Return Acknowledgement</div>
        </div>

        <div class="meta-box">
          <div class="meta-left">
            <div style="margin-bottom: 3px; font-size:13px;">To</div>
            <div class="row-line"><span class="lbl">DSK Code/ Name</span>: ${dskCode}/ ${dskName}</div>
            <div class="row-line"><span class="lbl">Route Name</span>: ${route}</div>
            <div class="row-line"><span class="lbl">Plant Id</span>: ${plantId}</div>
            <div class="row-line"><span class="lbl">Supervisor</span>: ${supervisor}</div>
          </div>
          <div class="meta-right">
            <div class="row-line"><span class="lbl-right">Document No</span>: ${docNo}</div>
            <div class="row-line"><span class="lbl-right">Document Date</span>: ${docDate}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="center" style="width: 10%;">SL</th>
              <th style="width: 38%;">Description</th>
              <th style="width: 52%;">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="center">01</td>
              <td>Date</td>
              <td>${docDate}</td>
            </tr>
            <tr>
              <td class="center">02</td>
              <td>Shift</td>
              <td>${shift}</td>
            </tr>
            <tr>
              <td class="center">03</td>
              <td>No of Cans</td>
              <td>${cans}</td>
            </tr>
            <tr>
              <td class="center">04</td>
              <td>Aprox Quantity</td>
              <td>${qty}</td>
            </tr>
            <tr>
              <td class="center">05</td>
              <td>Reason of Rejection</td>
              <td>${reason}</td>
            </tr>
          </tbody>
        </table>

        <div class="ack-signatures">
          <div class="sig-box-left">
            <strong>Received By</strong>
          </div>
          <div class="sig-box-right">
            <strong>Manager,</strong><br />
            <strong>Milk Chilling Plant</strong>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(printContainer)

    // 4. Trigger print on the window, and cleanup once print dialog finishes
    const cleanup = () => {
      printContainer.remove()
      style.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)

    // Give browser a moment to apply the DOM nodes
    setTimeout(() => {
      window.print()
    }, 50)
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      title="Print Rejection Slip"
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-300 hover:border-slate-400  text-[11px] font-semibold shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
    >
      <Printer className="w-3.5 h-3.5" />
    </button>
  )
}

export default RejectionPrintButton
