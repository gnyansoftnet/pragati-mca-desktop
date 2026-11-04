import { useEffect, useRef, useState } from 'react'
import type { SerialConnectDto } from '@shared/dtos/connection/serial.dto'

// Keep only the most recent characters so the screen never gets too heavy
const MAX_CHARS = 20000

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

export default function MachineConnectionRaw() {
  const [ports, setPorts] = useState<{ path: string }[]>([])
  const [path, setPath] = useState('')

  const [baudRate, setBaudRate] = useState('9600')
  const [parity, setParity] = useState('0') // 0=None, 1=Odd, 2=Even, 3=Mark, 4=Space
  const [dataBits, setDataBits] = useState('8')
  const [stopBits, setStopBits] = useState('1')

  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Raw data, exactly as it arrives (all chunks joined together)
  const [raw, setRaw] = useState('')
  const [chunkCount, setChunkCount] = useState(0)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)

  const loadPorts = async () => {
    try {
      setPorts(await window.api.getSerialPorts())
    } catch {
      setError('Could not load ports')
    }
  }

  useEffect(() => {
    loadPorts()
  }, [])

  // Receive data from the main process and just append it, no parsing at all
  useEffect(() => {
    const off = window.api.onSerialData((text: string) => {
      if (pausedRef.current) return
      setRaw((prev) => (prev + text).slice(-MAX_CHARS))
      setChunkCount((n) => n + 1)
    })
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [raw])

  const handleConnect = async () => {
    setError('')
    if (!path) return setError('Please select a port')

    const baud = Number(baudRate)
    const par = Number(parity)
    const bits = Number(dataBits)
    const stop = Number(stopBits)

    // if (!Number.isFinite(baud) || baud <= 0) return setError('Invalid baud rate')
    // if (![0, 1, 2, 3, 4].includes(par)) return setError('Parity must be 0, 1, 2, 3 or 4')
    // if (![5, 6, 7, 8].includes(bits)) return setError('Data bits must be 5, 6, 7 or 8')
    // if (![1, 1.5, 2].includes(stop)) return setError('Stop bits must be 1, 1.5 or 2')

    const payload = {
      path,
      baudRate: baud,
      parity: par,
      dataBits: bits,
      stopBits: stop
    } as SerialConnectDto

    setLoading(true)
    try {
      const res = await window.api.connectSerial(payload)
      if (res.ok) {
        setConnected(true)
        setRaw('')
        setChunkCount(0)
      } else {
        setError(res.error ?? 'Connection failed')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await window.api.disconnectSerial()
      setConnected(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
  }

  const clearData = () => {
    setRaw('')
    setChunkCount(0)
  }

  const copyData = () => {
    navigator.clipboard?.writeText(raw)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Machine Connection</h1>
          <p className="text-slate-500">Shows exactly what the machine sends</p>
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

      {/* Connection card */}
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
              type="number"
              className={fieldClass}
              value={baudRate}
              disabled={connected}
              onChange={(e) => setBaudRate(e.target.value)}
            />
          </Field>

          <Field label="Parity (0 None, 1 Odd, 2 Even)">
            <input
              type="number"
              className={fieldClass}
              value={parity}
              disabled={connected}
              onChange={(e) => setParity(e.target.value)}
            />
          </Field>

          <Field label="Data Bits">
            <input
              type="number"
              className={fieldClass}
              value={dataBits}
              disabled={connected}
              onChange={(e) => setDataBits(e.target.value)}
            />
          </Field>

          <Field label="Stop Bits">
            <input
              type="number"
              step="0.5"
              className={fieldClass}
              value={stopBits}
              disabled={connected}
              onChange={(e) => setStopBits(e.target.value)}
            />
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

      {/* Raw data card */}
      <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Received Data</h2>
            <p className="text-sm text-slate-500">
              {raw.length} characters in {chunkCount} {chunkCount === 1 ? 'chunk' : 'chunks'}
              {paused && ' (paused)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              disabled={!connected}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={copyData}
              disabled={!raw}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={clearData}
              disabled={!raw}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="h-96 overflow-auto rounded-2xl bg-slate-900 p-4">
          {raw ? (
            <pre className="whitespace-pre-wrap break-all font-mono text-sm text-green-400">
              {raw}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              {connected ? 'Waiting for data...' : 'Connect to a machine to see data here'}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  )
}
