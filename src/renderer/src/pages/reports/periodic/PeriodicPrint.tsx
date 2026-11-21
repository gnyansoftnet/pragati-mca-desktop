import React, { useEffect } from 'react'

export const PeriodicPrint: React.FC = () => {
  useEffect(() => {
    const style = document.createElement('style')

    style.innerHTML = `
      @media print {
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        tr { page-break-inside: avoid; }
      }
    `

    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Static rows matching the exact image
  const staticRows = [
    {
      route: 'ADASPUR-1215',
      mKg: '556.30',
      mFat: '4.05',
      mSnf: '8.28',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '556.30',
      tFat: '4.05',
      tSnf: '8.28'
    },
    {
      route: 'NAKHARA',
      mKg: '434.30',
      mFat: '4.42',
      mSnf: '8.37',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '434.30',
      tFat: '4.42',
      tSnf: '8.37'
    },
    {
      route: 'DHANAMANDAL-1215',
      mKg: '694.80',
      mFat: '0.00',
      mSnf: '0.00',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '694.80',
      tFat: '0.00',
      tSnf: '0.00'
    },
    {
      route: 'GOBINDAPUR-1215',
      mKg: '596.90',
      mFat: '4.26',
      mSnf: '8.41',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '596.90',
      tFat: '4.26',
      tSnf: '8.41'
    },
    {
      route: 'JHARAPADA-1215',
      mKg: '503.30',
      mFat: '4.27',
      mSnf: '8.30',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '503.30',
      tFat: '4.27',
      tSnf: '8.30'
    },
    {
      route: 'NIALI-1215',
      mKg: '727.00',
      mFat: '4.88',
      mSnf: '8.34',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '727.00',
      tFat: '4.88',
      tSnf: '8.34'
    },
    {
      route: 'GOBABASTA-1215',
      mKg: '299.90',
      mFat: '4.24',
      mSnf: '8.47',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '299.90',
      tFat: '4.24',
      tSnf: '8.47'
    },
    {
      route: 'BALIANTA',
      mKg: '304.30',
      mFat: '0.99',
      mSnf: '2.08',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '304.30',
      tFat: '0.99',
      tSnf: '2.08'
    },
    {
      route: 'SAGADAILO(1215)',
      mKg: '610.30',
      mFat: '3.91',
      mSnf: '8.10',
      eKg: '0.00',
      eFat: '0.00',
      eSnf: '0.00',
      tKg: '610.30',
      tFat: '3.91',
      tSnf: '8.10'
    }
  ]

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto bg-white pl-10 pr-10 pt-10 pb-2 print:pl-10 print:pr-10 print:pt-10 print:pb-2 shadow print:shadow-none font-sans text-black">
        {/* Report Header */}
        <div className="text-center mb-3">
          <h1 className="text-sm font-bold uppercase tracking-wide">
            PRAGATI MILK PRODUCTS PRIVATE LIMITED
          </h1>
          <p className="text-xs font-medium uppercase">
            CHILLING CENTER - 1215,Olarabindha, Balianta
          </p>
          <h2 className="text-xs font-bold uppercase tracking-wider">
            PERIODIC REPORT
          </h2>
          <p className="text-xs font-normal">
            18-11-2026&lt;---&gt;18-11-2026
          </p>
        </div>

        {/* Report Table */}
        <div className="w-full">
          <table className="w-full border-collapse border border-black text-[11px] leading-tight text-black">
            <thead>
              {/* Header Row 1 */}
              <tr>
                <th
                  rowSpan={2}
                  className="border border-black px-1 py-1 text-left font-normal align-top min-w-[130px]"
                >
                  Route
                </th>
                <th
                  colSpan={3}
                  className="border border-black px-1 py-0.5 text-left font-normal"
                >
                  Morning
                </th>
                <th
                  colSpan={3}
                  className="border border-black px-1 py-0.5 text-left font-normal"
                >
                  Evening
                </th>
                <th
                  colSpan={3}
                  className="border border-black px-1 py-0.5 text-left font-normal"
                >
                  Total
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr>
                {/* Morning Subheaders */}
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  KG
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  FAT(avg)
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  SNF(avg)
                </th>

                {/* Evening Subheaders */}
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  KG
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  FAT(avg)
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  SNF(avg)
                </th>

                {/* Total Subheaders */}
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  KG
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  FAT(avg)
                </th>
                <th className="border border-black px-1 py-0.5 text-left font-normal">
                  SNF(avg)
                </th>
              </tr>
            </thead>

            {/* Static Table Body */}
            <tbody>
              {staticRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-black px-1.5 py-0.5 text-left whitespace-nowrap">
                    {row.route}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.mKg}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.mFat}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.mSnf}
                  </td>

                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.eKg}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.eFat}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.eSnf}
                  </td>

                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.tKg}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.tFat}
                  </td>
                  <td className="border border-black px-1.5 py-0.5 text-right tabular-nums">
                    {row.tSnf}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Static Total Row */}
            <tfoot>
              <tr>
                <td className="border border-black px-1.5 py-0.5 text-left font-medium">
                  Total
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  4727.10
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  3.46
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  6.69
                </td>

                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  0.00
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  0.00
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  0.00
                </td>

                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  4727.10
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  3.46
                </td>
                <td className="border border-black px-1.5 py-0.5 text-right font-medium tabular-nums">
                  6.69
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PeriodicPrint