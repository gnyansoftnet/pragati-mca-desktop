import { useEffect, useState } from 'react'
import type { SerialConnectDto } from '@shared/dtos/connection/serial.dto'
// const PARITY_OPTIONS = ['none', 'even', 'odd', 'mark', 'space']
// const BAUD_OPTIONS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]
// const DATA_BITS_OPTIONS = [5, 6, 7, 8]
// const STOP_BITS_OPTIONS = [1, 1.5, 2]

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  )
}

export default function MacineConnection2() {
  const [ports, setPorts] = useState<{ path: string }[]>([])
  const [path, setPath] = useState('')
  const [baudRate, setBaudRate] = useState()
  const [parity, setParity] = useState<SerialConnectDto['parity']>('')
  const [dataBits, setDataBits] = useState<SerialConnectDto['dataBits']>()
  const [stopBits, setStopBits] = useState<SerialConnectDto['stopBits']>()

  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPorts()
  }, [])

  const loadPorts = async () => {
    try {
      setPorts(await window.api.getSerialPorts())
    } catch {
      setError('Could not load ports')
    }
  }

  const handleConnect = async () => {
    setError('')
    if (!path) {
      setError('Please select a port')
      return
    }

    setLoading(true)
    const res = await window.api.connectSerial({ path, baudRate, parity, dataBits, stopBits })
    setLoading(false)

    if (res.ok) setConnected(true)
    else setError(res.error ?? 'Connection failed')
  }

  const handleDisconnect = async () => {
    setLoading(true)
    await window.api.disconnectSerial()
    setLoading(false)
    setConnected(false)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Machine Connection</h1>
          <p className="text-slate-500">Connect your machine before collection</p>
        </div>

        <span
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
            connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-400'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Port Name">
            <div className="flex gap-2">
              <select
                className={fieldClass}
                value={path}
                disabled={connected}
                onChange={(e) => setPath(e.target.value)}
              >
                <option value="">Select port...</option>
                {ports.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.path}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadPorts}
                disabled={connected}
                title="Refresh ports"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
              >
                ↻
              </button>
            </div>
          </Field>

          <Field label="Baud Rate">
            <input
              type="string"
              className={fieldClass}
              value={baudRate}
              onChange={(e: any) => setBaudRate(e.target.value)}
            />
            {/* <select
              className={fieldClass}
              value={baudRate}
              disabled={connected}
              onChange={(e) => setBaudRate(Number(e.target.value))}
            >
              {BAUD_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select> */}
          </Field>

          <Field label="Parity">
            <input
              type="text"
              className={fieldClass}
              value={parity}
              onChange={(e: any) => setParity(e.target.value)}
            />
            {/* <select
              className={fieldClass}
              value={parity}
              disabled={connected}
              onChange={(e) => setParity(e.target.value)}
            >
              {PARITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select> */}
          </Field>

          <Field label="Data Bits">
            <input
              type="text"
              className={fieldClass}
              value={dataBits}
              onChange={(e: any) => setDataBits(e.target.value)}
            />
            {/* <select
              className={fieldClass}
              value={dataBits}
              disabled={connected}
              onChange={(e) => setDataBits(Number(e.target.value))}
            >
              {DATA_BITS_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select> */}
          </Field>

          <Field label="Stop Bits">
            <input
              type="text"
              className={fieldClass}
              value={stopBits}
              onChange={(e: any) => setStopBits(e.target.value)}
            />
            {/* <select
              className={fieldClass}
              value={stopBits}
              disabled={connected}
              onChange={(e) => setStopBits(Number(e.target.value))}
            >
              {STOP_BITS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select> */}
          </Field>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!connected ? (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-blue-900 to-sky-500 px-8 py-3 font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="rounded-2xl bg-red-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}







// import { useEffect, useState } from 'react'

// // const PARITY_OPTIONS = ['none', 'even', 'odd', 'mark', 'space']
// // const BAUD_OPTIONS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]
// // const DATA_BITS_OPTIONS = [5, 6, 7, 8]
// // const STOP_BITS_OPTIONS = [1, 1.5, 2]

// const fieldClass =
//   'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60'

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <div className="flex flex-col gap-2">
//       <label className="text-sm font-semibold text-slate-700">{label}</label>
//       {children}
//     </div>
//   )
// }

// export default function MacineConnection2() {
//   const [ports, setPorts] = useState<{ path: string }[]>([])
//   const [path, setPath] = useState('')
//   const [baudRate, setBaudRate] = useState()
//   const [parity, setParity] = useState('')
//   const [dataBits, setDataBits] = useState()
//   const [stopBits, setStopBits] = useState()

//   const [connected, setConnected] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     loadPorts()
//   }, [])

//   const loadPorts = async () => {
//     try {
//       setPorts(await window.api.getSerialPorts())
//     } catch {
//       setError('Could not load ports')
//     }
//   }

//   const handleConnect = async () => {
//     setError('')
//     if (!path) {
//       setError('Please select a port')
//       return
//     }

//     setLoading(true)
//     const res = await window.api.connectSerial({ path, baudRate, parity, dataBits, stopBits })
//     setLoading(false)

//     if (res.ok) setConnected(true)
//     else setError(res.error ?? 'Connection failed')
//   }

//   const handleDisconnect = async () => {
//     setLoading(true)
//     await window.api.disconnectSerial()
//     setLoading(false)
//     setConnected(false)
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6 flex items-start justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Machine Connection</h1>
//           <p className="text-slate-500">Connect your machine before collection</p>
//         </div>

//         <span
//           className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
//             connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
//           }`}
//         >
//           <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-slate-400'}`} />
//           {connected ? 'Connected' : 'Disconnected'}
//         </span>
//       </div>

//       {/* Card */}
//       <div className="rounded-3xl bg-white p-5 shadow-sm">
//         <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
//           <Field label="Port Name">
//             <div className="flex gap-2">
//               <select
//                 className={fieldClass}
//                 value={path}
//                 disabled={connected}
//                 onChange={(e) => setPath(e.target.value)}
//               >
//                 <option value="">Select port...</option>
//                 {ports.map((p) => (
//                   <option key={p.path} value={p.path}>
//                     {p.path}
//                   </option>
//                 ))}
//               </select>
//               <button
//                 type="button"
//                 onClick={loadPorts}
//                 disabled={connected}
//                 title="Refresh ports"
//                 className="rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-600 hover:bg-slate-100 disabled:opacity-60"
//               >
//                 ↻
//               </button>
//             </div>
//           </Field>

//           <Field label="Baud Rate">
//             <input
//               type="string"
//               className={fieldClass}
//               value={baudRate}
//               onChange={(e: any) => setBaudRate(e.target.value)}
//             />
//             {/* <select
//               className={fieldClass}
//               value={baudRate}
//               disabled={connected}
//               onChange={(e) => setBaudRate(Number(e.target.value))}
//             >
//               {BAUD_OPTIONS.map((b) => (
//                 <option key={b} value={b}>
//                   {b}
//                 </option>
//               ))}
//             </select> */}
//           </Field>

//           <Field label="Parity">
//             <input
//               type="text"
//               className={fieldClass}
//               value={parity}
//               onChange={(e: any) => setParity(e.target.value)}
//             />
//             {/* <select
//               className={fieldClass}
//               value={parity}
//               disabled={connected}
//               onChange={(e) => setParity(e.target.value)}
//             >
//               {PARITY_OPTIONS.map((p) => (
//                 <option key={p} value={p}>
//                   {p.charAt(0).toUpperCase() + p.slice(1)}
//                 </option>
//               ))}
//             </select> */}
//           </Field>

//           <Field label="Data Bits">
//             <input
//               type="text"
//               className={fieldClass}
//               value={dataBits}
//               onChange={(e: any) => setDataBits(e.target.value)}
//             />
//             {/* <select
//               className={fieldClass}
//               value={dataBits}
//               disabled={connected}
//               onChange={(e) => setDataBits(Number(e.target.value))}
//             >
//               {DATA_BITS_OPTIONS.map((d) => (
//                 <option key={d} value={d}>
//                   {d}
//                 </option>
//               ))}
//             </select> */}
//           </Field>

//           <Field label="Stop Bits">
//             <input
//               type="text"
//               className={fieldClass}
//               value={stopBits}
//               onChange={(e: any) => setStopBits(e.target.value)}
//             />
//             {/* <select
//               className={fieldClass}
//               value={stopBits}
//               disabled={connected}
//               onChange={(e) => setStopBits(Number(e.target.value))}
//             >
//               {STOP_BITS_OPTIONS.map((s) => (
//                 <option key={s} value={s}>
//                   {s}
//                 </option>
//               ))}
//             </select> */}
//           </Field>
//         </div>

//         {error && (
//           <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="mt-6 flex justify-end">
//           {!connected ? (
//             <button
//               onClick={handleConnect}
//               disabled={loading}
//               className="rounded-2xl bg-gradient-to-r from-blue-900 to-sky-500 px-8 py-3 font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-60"
//             >
//               {loading ? 'Connecting...' : 'Connect'}
//             </button>
//           ) : (
//             <button
//               onClick={handleDisconnect}
//               disabled={loading}
//               className="rounded-2xl bg-red-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-red-700 disabled:opacity-60"
//             >
//               {loading ? 'Disconnecting...' : 'Disconnect'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


// export default function MacineConnection2() {
  

//   return (
//     <></>
//   )
// }
