import React, { useState, useEffect, useCallback } from 'react'
import { Cable, RefreshCw } from 'lucide-react'
import Button1 from '../../../components/buttons/Button1'
import PageBreadcrumb from '../../../components/breadcrumbs/PageBreadcrumb'
import CustomForm from '../../../components/customform/CustomForm'
import type {
  ParserType,
  PortConfig,
  PortListItem,
  PortState,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'
import { useSerialSnapshot, refreshSerialSnapshot } from '@renderer/hooks/useSerial'
import { isAnalyzer } from '@shared/dtos/connection/serial-com-port.dto'
type Parity = 'none' | 'odd' | 'even' | 'mark' | 'space'
type Machine = Exclude<ParserType, 'raw'>
interface Settings {
  baudRate: number
  parity: Parity
  dataBits: number
  stopBits: number
}
const MACHINES: { value: Machine; label: string }[] = [
  { value: 'weight', label: 'Weight Scale' },
  { value: 'analyzer-1', label: 'Milk Analyzer 1' },
  { value: 'analyzer-2', label: 'Milk Analyzer 2' },
  { value: 'analyzer-3', label: 'Milk Analyzer 3' },
  { value: 'analyzer-4', label: 'Milk Analyzer 4' }
]

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

const DEFAULT_SETTINGS: Settings = { baudRate: 9600, parity: 'none', dataBits: 8, stopBits: 1 }

// Remember the settings of each machine in localStorage
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
  } catch {}
}

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

  // Live snapshot from serial hook + local snapshot for instant updates
  const snap = useSerialSnapshot()
  const [localSnap, setLocalSnap] = useState<SerialSnapshot | null>(null)

  // Use localSnap if freshly updated, otherwise use live hook snap
  const activeSnap = localSnap || snap

  // Clear local override once the live hook catches up
  useEffect(() => {
    setLocalSnap(null)
  }, [snap])

  const patchSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  // ---------- Port Listing ----------
  const refreshPorts = useCallback(async () => {
    try {
      const ports = await window.api.getSerialPorts()
      setAvailable(ports)
    } catch {
      setError('Could not read the port list')
    }
  }, [])

  useEffect(() => {
    refreshPorts()
    window.addEventListener('focus', refreshPorts)
    return () => window.removeEventListener('focus', refreshPorts)
  }, [refreshPorts])

  // ---------- Dropdown Options ----------
  // Machines are ALWAYS selectable (multiple scales/analyzers allowed)
  const usedMachines = new Set(activeSnap.ports.map((p) => p.parserType))
  const machineOptions = MACHINES.filter((m) => !usedMachines.has(m.value))

  // Only ports currently in use cannot be reselected
  const usedPaths = new Set(activeSnap.ports.map((p) => p.path))
  const portOptions = available
    .filter((p) => !usedPaths.has(p.path))
    .map((p) => ({
      label: p.friendlyName ? `${p.path} - ${p.friendlyName}` : p.path,
      value: p.path
    }))
  const onMachineChange = (value: string) => {
    setMachine(value as Machine | '')
    if (value) setSettings(loadSettings(value))
  }
  const getMachineDisplayTitle = (portItem: PortState) => {
    return MACHINES.find((m) => m.value === portItem.parserType)?.label ?? portItem.parserType
  }

  // ---------- Connect Action ----------
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
        setMessage(`Connected on ${port}`)
        setMachine('')
        setPort('')

        // Instantly fetch snapshot so UI updates with zero delay
        refreshSerialSnapshot()
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

  // ---------- Disconnect Action ----------
  async function handleDisconnect(path: string) {
    setError('')
    setMessage('')
    try {
      await window.api.disconnectSerial(path)

      // Instantly fetch snapshot so UI updates immediately
      refreshSerialSnapshot()
    } catch (e) {
      setError((e as Error).message)
    }
    refreshPorts()
  }

  const connectedCount = activeSnap.ports.filter((p) => p.status === 'connected').length
  const canConnect = !!machine && !!port && !busy

  const renderParsedReading = (portItem: PortState) => {
    if (portItem.parserType === 'weight') {
      const w = activeSnap.readings.weight?.value
      if (w === undefined) return null
      return (
        <p className="mt-1 text-xs font-semibold text-emerald-700">
          Parsed Weight: <span className="font-mono">{w} kg</span>
        </p>
      )
    }

    if (isAnalyzer(portItem.parserType)) {
      const fat = activeSnap.readings[`${portItem.parserType}.fat`]?.value
      const snf = activeSnap.readings[`${portItem.parserType}.snf`]?.value
      const wtr = activeSnap.readings[`${portItem.parserType}.wtr`]?.value
      const temp = activeSnap.readings[`${portItem.parserType}.temp`]?.value

      if (fat === undefined && snf === undefined && wtr === undefined && temp === undefined) {
        return null
      }

      return (
        <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            FAT: {fat ?? '-'}%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            SNF: {snf ?? '-'}%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">
            WTR: {wtr ?? '-'}%
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            TEMP: {temp ?? '-'}°C
          </span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageBreadcrumb
          title="Machine Connection"
          // desc="Connect your machines before milk collection"
        />
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
          <span
            className={`h-2.5 w-2.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {connectedCount > 0
            ? `${connectedCount} ${connectedCount === 1 ? 'machine' : 'machines'} connected`
            : 'Disconnected'}
        </span>
      </div>

      {/* Connect Form */}
      <div className="mt-2">
        <CustomForm
          onSubmit={(e) => {
            e.preventDefault()
            handleConnect()
          }}
          className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-xs"
        >
          <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 gap-4">
            {/* Machine Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">
                Select Machine Type<span className="text-rose-500">*</span>
              </label>
              <CustomForm.CustomSelectField
                name="machine"
                value={machine}
                onChange={(e: any) => onMachineChange(e.target.value)}
                options={machineOptions}
                placeholder={
                  machineOptions.length > 0 ? 'Select machine type' : 'All machines connected'
                }
              />
            </div>

            {/* Port Selection with refresh button */}
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
                    placeholder={portOptions.length > 0 ? 'Select port...' : 'No free ports'}
                  />
                </div>
                <button
                  type="button"
                  title="Refresh ports"
                  onClick={refreshPorts}
                  className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Baud Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Baud Rate</label>
              <CustomForm.CustomSelectField
                name="baudRate"
                value={settings.baudRate}
                onChange={(e: any) => patchSettings({ baudRate: Number(e.target.value) })}
                options={BAUD_OPTIONS}
              />
            </div>

            {/* Parity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Parity</label>
              <CustomForm.CustomSelectField
                name="parity"
                value={settings.parity}
                onChange={(e: any) => patchSettings({ parity: e.target.value as Parity })}
                options={PARITY_OPTIONS}
              />
            </div>

            {/* Data Bits */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 mb-2">Data Bits</label>
              <CustomForm.CustomSelectField
                name="dataBits"
                value={settings.dataBits}
                onChange={(e: any) => patchSettings({ dataBits: Number(e.target.value) })}
                options={DATA_BITS_OPTIONS}
              />
            </div>

            {/* Stop Bits */}
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

          <div className="flex justify-end items-center gap-2.5 mt-4 pt-2 border-t border-slate-100">
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

      {/* Connected Machines List with Dynamic Numbers (e.g. Weight Scale 1, Weight Scale 2) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Connected Machines</h2>

        {activeSnap.ports.length === 0 && (
          <p className="text-xs text-slate-500 py-3">No machine connected yet.</p>
        )}

        {activeSnap.ports.map((p) => {
          const displayTitle = getMachineDisplayTitle(p)

          return (
            <div
              key={p.path}
              className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColor(p.status)}`} />
                  <span>{displayTitle}</span>
                  <span className="font-normal text-slate-500 font-mono text-xs">({p.path})</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      p.status === 'connected'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {p.error && <p className="mt-1 text-xs text-rose-600">{p.error}</p>}

                {p.lastLine && (
                  <p className="mt-1 text-xs text-slate-500">
                    Last raw reading:{' '}
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
                      {p.lastLine}
                    </code>
                    {p.lastLineParsed === false && (
                      <span className="text-amber-600 ml-1">· (Unparsed noise)</span>
                    )}
                  </p>
                )}

                {renderParsedReading(p)}
              </div>

              <button
                type="button"
                onClick={() => handleDisconnect(p.path)}
                className="shrink-0 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 text-xs font-semibold cursor-pointer transition"
              >
                {p.status === 'connected' ? 'Disconnect' : 'Remove'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MacineConnection
