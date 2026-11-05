// import React, { useState, useEffect, useCallback } from 'react'
// import Button1 from '../../../components/buttons/Button1'
// import PageBreadcrumb from '../../../components/breadcrumbs/PageBreadcrumb'
// import CustomForm from '../../../components/customform/CustomForm'
// import { Cable } from 'lucide-react'
// import type { PortListItem, SerialConnectDto } from '@shared/dtos/connection/serial-com-port.dto'
// import { useSerialSnapshot } from '@renderer/hooks/useSerial'

// // const BAUD_OPTIONS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]
// // const DATA_BITS_OPTIONS: SerialConnectDto['dataBits'][] = [5, 6, 7, 8]
// // const STOP_BITS_OPTIONS: SerialConnectDto['stopBits'][] = [1, 1.5, 2]

// export const MacineConnection: React.FC = () => {
//   const [port, setPort] = useState<string>('')
//   const [machine, setMachine] = useState<string>('')
//   const [baudRate, setBaudRate] = useState<number>(9600)
//   const [parity, setParity] = useState<SerialConnectDto['parity']>('none')
//   const [dataBits, setDataBits] = useState<SerialConnectDto['dataBits']>(8)
//   const [stopBits, setStopBits] = useState<SerialConnectDto['stopBits']>(1)

//   const snap = useSerialSnapshot()
//   const [available, setAvailable] = useState<PortListItem[]>([])

//   const refreshPorts = useCallback(async () => {
//     try {
//       const ports = await window.api.getSerialPorts()
//       setAvailable(ports)

//       console.log('Available ports:', ports)
//     } catch (error) {
//       console.error('Could not read the port list:', error)
//     }
//   }, [])

//   useEffect(() => {
//     refreshPorts()
//   }, [refreshPorts])

//   const machineOptions = [
//     { value: 'm1', label: 'Weight Scale' },
//     { value: 'm2', label: 'Milk Analyzer' }
//   ]

//   const PARITY_OPTIONS: SerialConnectDto['parity'][] = ['none', 'even', 'odd', 'mark', 'space']

//   const paritySelectOptions = PARITY_OPTIONS.map((item) => ({
//     label: item.charAt(0).toUpperCase() + item.slice(1),
//     value: item
//   }))

//   const BAUD_OPTIONS: SerialConnectDto['baudRate'][] = [
//     1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200
//   ]
//   const baudSelectOptions = BAUD_OPTIONS.map((item) => ({
//     label: String(item),
//     value: item
//   }))

//   const DATA_BITS_OPTIONS: SerialConnectDto['dataBits'][] = [5, 6, 7, 8]
//   const databitsSelectOptions = DATA_BITS_OPTIONS.map((item) => ({
//     label: String(item),
//     value: item
//   }))

//   const STOP_BITS_OPTIONS: SerialConnectDto['stopBits'][] = [1, 1.5, 2]
//   const stopBitsSelectOptions = STOP_BITS_OPTIONS.map((item) => ({
//     label: String(item),
//     value: item
//   }))

//   const used = new Set(snap.ports.map((p) => p.path))
//   const freePorts = available.filter((p) => !used.has(p.path))

//   const portSelectOptions = freePorts.map((p) => ({
//     label: p.friendlyName ? `${p.path} - ${p.friendlyName}` : p.path,
//     value: p.path
//   }))

//   console.log('portSelectOptions', portSelectOptions)

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <PageBreadcrumb title="Macine Connection" desc="Connect you macine before collection" />
//       </div>

//       <div className="mt-2">
//         <CustomForm
//           onSubmit={(e) => e.preventDefault()}
//           className="w-full p-3 bg-white rounded-2xl border border-slate-100"
//         >
//           <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-4">
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">Select Machine</label>
//               <CustomForm.CustomSelectField
//                 name="center"
//                 value={machine}
//                 onChange={(e: any) => setMachine(e.target.value)}
//                 options={machineOptions}
//                 placeholder="Selct a machine"
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">Select Port Name</label>
//               <CustomForm.CustomSelectField
//                 name="port"
//                 value={port}
//                 onChange={(e: any) => setPort(e.target.value)}
//                 options={portSelectOptions}
//                 placeholder="Select port..."
//               />
//               {/* <select value={ports} onChange={(e) => setPorts('path', e.target.value)}>
//                 <option value="">Select port...</option>
//                 {freePorts.map((p) => (
//                   <option key={p.path} value={p.path}>
//                     {p.path}
//                     {p.friendlyName ? ` - ${p.friendlyName}` : ''}
//                   </option>
//                 ))}
//               </select> */}
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">
//                 Parity <span className="text-rose-500">*</span>
//               </label>
//               <CustomForm.CustomSelectField
//                 name="parity"
//                 value={parity}
//                 onChange={(e: any) => setParity(e.target.value)}
//                 options={paritySelectOptions}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">Braude Rate</label>
//               <CustomForm.CustomSelectField
//                 name="baudRate"
//                 value={baudRate}
//                 onChange={(e: any) => setBaudRate(Number(e.target.value))}
//                 options={baudSelectOptions}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">Data Bits</label>
//               <CustomForm.CustomSelectField
//                 name="dataBits"
//                 value={dataBits}
//                 onChange={(e: any) => setDataBits(e.target.value)}
//                 options={databitsSelectOptions}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-xs font-semibold text-slate-700 mb-2">Stop Bits</label>
//               <CustomForm.CustomSelectField
//                 name="stopBits"
//                 value={stopBits}
//                 onChange={(e: any) => setStopBits(e.target.value)}
//                 options={stopBitsSelectOptions}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end items-center gap-2.5 mt-3">
//             <div className="">
//               <Button1
//                 variant="primary"
//                 icon={<Cable className="w-3.5 h-3.5 text-white" />}
//                 label="Connect"
//               />
//             </div>
//           </div>
//         </CustomForm>
//       </div>
//     </div>
//   )
// }

import React, { useState, useEffect, useCallback } from 'react'
import { Cable, RefreshCw } from 'lucide-react'
import Button1 from '../../../components/buttons/Button1'
import PageBreadcrumb from '../../../components/breadcrumbs/PageBreadcrumb'
import CustomForm from '../../../components/customform/CustomForm'
import type { PortConfig, PortListItem } from '@shared/dtos/connection/serial-com-port.dto'
import { useSerialSnapshot } from '@renderer/hooks/useSerial'

type Parity = 'none' | 'odd' | 'even' | 'mark' | 'space'
type Machine = 'weight' | 'milkAnalyzer'

interface Settings {
  baudRate: number
  parity: Parity
  dataBits: number
  stopBits: number
}

const MACHINES: { value: Machine; label: string }[] = [
  { value: 'weight', label: 'Weight Scale' },
  { value: 'milkAnalyzer', label: 'Milk Analyzer' }
]

// the service expects a number for parity
const PARITY_CODE: Record<Parity, number> = { none: 0, odd: 1, even: 2, mark: 3, space: 4 }

const PARITY_OPTIONS = (Object.keys(PARITY_CODE) as Parity[]).map((p) => ({
  label: p.charAt(0).toUpperCase() + p.slice(1),
  value: p
}))
const BAUD_OPTIONS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200].map((n) => ({
  label: String(n),
  value: n
}))
const DATA_BITS_OPTIONS = [5, 6, 7, 8].map((n) => ({ label: String(n), value: n }))
const STOP_BITS_OPTIONS = [1, 1.5, 2].map((n) => ({ label: String(n), value: n }))

const LIVE_VALUES = [
  { key: 'weight', label: 'Weight (LTR)' },
  { key: 'clr', label: 'CLR (%)' },
  { key: 'fat', label: 'FAT (%)' },
  { key: 'snf', label: 'SNF (%)' }
]

const DEFAULT_SETTINGS: Settings = { baudRate: 9600, parity: 'none', dataBits: 8, stopBits: 1 }

// Remember the settings of each machine, so the operator doesn't retype them after every restart
const storeKey = (machine: string) => `serial-settings:${machine}`

function loadSettings(machine: string): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(storeKey(machine)) ?? '{}') }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(machine: string, settings: Settings) {
  try {
    localStorage.setItem(storeKey(machine), JSON.stringify(settings))
  } catch {
    /* storage not available: ignore */
  }
}

const machineLabel = (value: string) => MACHINES.find((m) => m.value === value)?.label ?? value

const dotColor = (status: string) =>
  status === 'connected'
    ? 'bg-emerald-500'
    : status === 'connecting' || status === 'reconnecting'
      ? 'bg-amber-500'
      : 'bg-slate-400'

export const MacineConnection: React.FC = () => {
  const [machine, setMachine] = useState<Machine | ''>('')
  const [port, setPort] = useState<string>('')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [available, setAvailable] = useState<PortListItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // connected ports + latest values, live from the main process
  const snap = useSerialSnapshot()

  const patchSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  // ---------- port list ----------

  const refreshPorts = useCallback(async () => {
    try {
      setAvailable(await window.api.getSerialPorts())
    } catch {
      setError('Could not read the port list')
    }
  }, [])

  // load once, and again whenever the window gets focus (after plugging in a cable)
  useEffect(() => {
    refreshPorts()
    window.addEventListener('focus', refreshPorts)
    return () => window.removeEventListener('focus', refreshPorts)
  }, [refreshPorts])

  // ---------- dropdown options ----------

  // a machine that is already connected can't be chosen again
  const connectedRoles = new Set(snap.ports.map((p) => p.parserType))
  const machineOptions = MACHINES.filter((m) => !connectedRoles.has(m.value))

  // a port that is already used can't be chosen again
  const usedPaths = new Set(snap.ports.map((p) => p.path))
  const portOptions = available
    .filter((p) => !usedPaths.has(p.path))
    .map((p) => ({
      label: p.friendlyName ? `${p.path} - ${p.friendlyName}` : p.path,
      value: p.path
    }))

  // ---------- actions ----------

  const onMachineChange = (value: string) => {
    setMachine(value as Machine | '')
    if (value) setSettings(loadSettings(value)) // that machine's last used settings
  }

  async function handleConnect() {
    if (!machine || !port || busy) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const cfg: PortConfig = {
        path: port,
        baudRate: settings.baudRate,
        parity: settings.parity,
        dataBits: settings.dataBits as PortConfig['dataBits'],
        stopBits: settings.stopBits as PortConfig['stopBits'],
        parserType: machine
      }
      const res = await window.api.connectSerial(cfg)
      if (res.ok) {
        saveSettings(machine, settings)
        setMessage(`${machineLabel(machine)} connected on ${port}`)
        setMachine('')
        setPort('')
      } else {
        setError(res.error ?? 'Could not connect')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
      refreshPorts()
    }
  }

  async function handleDisconnect(path: string) {
    setError('')
    setMessage('')
    try {
      await window.api.disconnectSerial(path)
    } catch (e) {
      setError((e as Error).message)
    }
    refreshPorts()
  }

  const connectedCount = snap.ports.filter((p) => p.status === 'connected').length
  const canConnect = !!machine && !!port && !busy

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb title="Machine Connection" desc="Connect your machine before collection" />
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
          <span
            className={`h-2.5 w-2.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {connectedCount > 0 ? `${connectedCount} machine connected` : 'Disconnected'}
        </span>
      </div>

      {/* ---------- connect form ---------- */}
      <div className="mt-2">
        <CustomForm
          onSubmit={(e) => {
            e.preventDefault()
            handleConnect()
          }}
          className="w-full p-3 bg-white rounded-2xl border border-slate-100"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Select Machine <span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectField
                name="machine"
                value={machine}
                onChange={(e: any) => onMachineChange(e.target.value)}
                options={machineOptions}
                placeholder={machineOptions.length ? 'Select a machine' : 'All machines connected'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Select Port Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <CustomForm.CustomSelectField
                    name="port"
                    value={port}
                    onChange={(e: any) => setPort(e.target.value)}
                    options={portOptions}
                    placeholder="Select port..."
                  />
                </div>
                <button
                  type="button"
                  title="Refresh ports"
                  onClick={refreshPorts}
                  className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Baud Rate</label>
              <CustomForm.CustomSelectField
                name="baudRate"
                value={settings.baudRate}
                onChange={(e: any) => patchSettings({ baudRate: Number(e.target.value) })}
                options={BAUD_OPTIONS}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Parity</label>
              <CustomForm.CustomSelectField
                name="parity"
                value={settings.parity}
                onChange={(e: any) => patchSettings({ parity: e.target.value as Parity })}
                options={PARITY_OPTIONS}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Data Bits</label>
              <CustomForm.CustomSelectField
                name="dataBits"
                value={settings.dataBits}
                onChange={(e: any) => patchSettings({ dataBits: Number(e.target.value) })}
                options={DATA_BITS_OPTIONS}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Stop Bits</label>
              <CustomForm.CustomSelectField
                name="stopBits"
                value={settings.stopBits}
                onChange={(e: any) => patchSettings({ stopBits: Number(e.target.value) })}
                options={STOP_BITS_OPTIONS}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}
          {message && <p className="mt-3 text-xs font-medium text-emerald-600">{message}</p>}

          <div className="flex justify-end items-center gap-2.5 mt-3">
            <Button1
              variant="primary"
              icon={<Cable className="w-3.5 h-3.5 text-white" />}
              label={busy ? 'Connecting...' : 'Connect'}
              onClick={handleConnect}
              disabled={!canConnect}
            />
          </div>
        </CustomForm>
      </div>

      {/* ---------- connected machines ---------- */}
      <div className="p-3 bg-white rounded-2xl border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Connected machines</h2>

        {snap.ports.length === 0 && <p className="text-xs text-slate-500">No machine connected</p>}

        {snap.ports.map((p) => (
          <div
            key={p.path}
            className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor(p.status)}`} />
                {machineLabel(p.parserType)}
                <span className="font-normal text-slate-500">({p.path})</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {p.status}
                </span>
              </div>

              {p.error && <p className="mt-1 text-xs text-amber-600">{p.error}</p>}

              {p.lastLine && (
                <p className="mt-1 text-xs text-slate-500">
                  Last line from machine:{' '}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5">{p.lastLine}</code>
                  {p.lastLineParsed === false && (
                    <span className="text-amber-600"> · parser did not understand this line</span>
                  )}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleDisconnect(p.path)}
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {p.status === 'connected' ? 'Disconnect' : 'Remove'}
            </button>
          </div>
        ))}
      </div>

      {/* ---------- live values (check before going to collection) ---------- */}
      {/* <div className="p-3 bg-white rounded-2xl border border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Latest values received</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {LIVE_VALUES.map(({ key, label }) => {
            const r = snap.readings[key]
            return (
              <div key={key} className="rounded-xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-lg font-semibold text-slate-800">
                  {r ? String(r.value) : '--'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {r ? new Date(r.at).toLocaleTimeString() : 'no data yet'}
                </div>
              </div>
            )
          })}
        </div>
      </div> */}
    </div>
  )
}
