import { singleton } from 'tsyringe'
import { SerialPort } from 'serialport'
import { BrowserWindow } from 'electron'
import {
  isAnalyzer,
  PortConfig,
  PortListItem,
  PortState,
  SerialResult,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'
import { ParseResult, PARSERS } from './serial-parser'

// Channel the main process PUSHES on (different from the 'serial:snapshot' invoke channel)
export const SERIAL_UPDATE_CHANNEL = 'serial:update'

@singleton()
export class SerialComPortService {
  private ports = new Map<string, SerialPort>() // open ports
  private states = new Map<string, PortState>() // what the UI shows
  private readings = new Map<string, { value: string | number; at: number; path: string }>()
  private buffers = new Map<string, string>() // unfinished text per port
  private connecting = new Map<string, string>() // path -> parserType while a connect is in progress
  private pushTimer: NodeJS.Timeout | null = null
  private getWindow: () => BrowserWindow | null = () => null

  setWindowGetter(getter: () => BrowserWindow | null) {
    this.getWindow = getter
  }

  // ---------- snapshot (what the UI reads) ----------

  getSnapshot(): SerialSnapshot {
    const readings: SerialSnapshot['readings'] = {}
    for (const [key, r] of this.readings) readings[key] = { value: r.value, at: r.at }
    return { readings, ports: [...this.states.values()] }
  }

  private push() {
    if (this.pushTimer) return // an update is already scheduled
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null
      const win = this.getWindow()
      if (win && !win.isDestroyed()) win.webContents.send(SERIAL_UPDATE_CHANNEL, this.getSnapshot())
    }, 100)
  }

  private setState(path: string, patch: Partial<PortState>) {
    const prev = this.states.get(path)
    this.states.set(path, { path, parserType: 'raw', status: 'disconnected', ...prev, ...patch })
    this.push()
  }

  // call after a save so old FAT/SNF can't be reused
  clearReadings(keys?: string[]) {
    if (keys) keys.forEach((k) => this.readings.delete(k))
    else this.readings.clear()
    this.push()
  }

  private dropPort(path: string) {
    this.ports.delete(path)
    this.buffers.delete(path)
    for (const [key, r] of this.readings) if (r.path === path) this.readings.delete(key)
  }

  // ---------- incoming data ----------

  // keep the raw text and let the parser of this machine do the rest
  private onData(path: string, chunk: Buffer) {
    // latin1 keeps every byte as-is (ascii would strip the high bit)
    const text = (this.buffers.get(path) ?? '') + chunk.toString('latin1')

    let result: ParseResult = { data: null, rest: '' }
    try {
      result = PARSERS[this.states.get(path)?.parserType ?? 'raw'].parse(text)
    } catch {
      /* bad data: ignore */
    }

    this.buffers.set(path, result.rest.slice(-1024)) // unfinished text, capped

    if (result.data) {
      const at = Date.now()
      const role = this.states.get(path)?.parserType ?? 'raw'
      for (const [key, value] of Object.entries(result.data)) {
        // analyzers are stored as "analyzer-2.fat" so four analyzers can't overwrite each other
        const name = isAnalyzer(role) ? `${role}.${key}` : key
        this.readings.set(name, { value, at, path })
      }
    }

    // show the last complete frame in the UI (helps when checking a parser)
    if (result.raw)
      this.setState(path, { lastLine: result.raw, lastLineParsed: result.data !== null })
  }

  // ---------- ports ----------

  async listPorts(): Promise<PortListItem[]> {
    const list = await SerialPort.list()
    return list.map((p) => ({
      path: p.path,
      friendlyName: p.friendlyName,
      manufacturer: p.manufacturer
    }))
  }

  async connect(cfg: PortConfig): Promise<SerialResult> {
    const parity = cfg.parity
    if (!cfg.path || !parity || !PARSERS[cfg.parserType]) {
      return { ok: false, error: 'Invalid port settings' }
    }

    // two ports with the same role would overwrite each other's values
    // (checks connected ports AND ports that are still opening)
    if (cfg.parserType !== 'raw') {
      for (const s of this.states.values()) {
        if (s.path !== cfg.path && s.parserType === cfg.parserType) {
          return { ok: false, error: `${s.path} is already connected as ${cfg.parserType}` }
        }
      }
      for (const [path, type] of this.connecting) {
        if (path !== cfg.path && type === cfg.parserType) {
          return { ok: false, error: `${path} is already connecting as ${cfg.parserType}` }
        }
      }
    }

    if (this.connecting.has(cfg.path)) {
      return { ok: false, error: `${cfg.path} is already connecting` }
    }
    this.connecting.set(cfg.path, cfg.parserType)

    try {
      await this.disconnect(cfg.path) // reconnecting the same port: close the old one first

      const p = new SerialPort({
        path: cfg.path,
        baudRate: cfg.baudRate,
        parity,
        dataBits: cfg.dataBits as 5 | 6 | 7 | 8,
        stopBits: cfg.stopBits as 1 | 1.5 | 2,
        autoOpen: false
      })

      // without an 'error' listener a port error can crash the app
      p.on('error', (err) => this.setState(cfg.path, { error: err.message }))
      p.on('data', (chunk: Buffer) => this.onData(cfg.path, chunk))

      // cable unplugged / machine off
      p.on('close', () => {
        if (this.ports.get(cfg.path) !== p) return // we closed it ourselves
        this.dropPort(cfg.path)
        this.setState(cfg.path, { status: 'disconnected', error: 'Connection lost' })
      })

      try {
        await new Promise<void>((resolve, reject) =>
          p.open((err) => (err ? reject(err) : resolve()))
        )
      } catch (e) {
        // failed to open: detach listeners so no ghost state appears later
        p.removeAllListeners()
        p.on('error', () => {})
        return { ok: false, error: (e as Error).message }
      }

      this.ports.set(cfg.path, p)
      this.setState(cfg.path, { parserType: cfg.parserType, status: 'connected', error: undefined })
      return { ok: true }
    } finally {
      this.connecting.delete(cfg.path)
    }
  }

  async disconnect(path: string): Promise<SerialResult> {
    const p = this.ports.get(path)
    this.dropPort(path)
    this.states.delete(path)

    if (p) {
      p.removeAllListeners()
      p.on('error', () => {})
      if (p.isOpen) await new Promise<void>((resolve) => p.close(() => resolve()))
    }

    this.push()
    return { ok: true }
  }

  // app quit: close every port
  async shutdown() {
    if (this.pushTimer) {
      clearTimeout(this.pushTimer)
      this.pushTimer = null
    }
    await Promise.allSettled([...this.ports.keys()].map((path) => this.disconnect(path)))
  }
}
