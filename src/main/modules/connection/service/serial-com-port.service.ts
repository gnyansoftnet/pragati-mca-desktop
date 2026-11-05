import { singleton } from 'tsyringe'

import { SerialPort } from 'serialport'

import { BrowserWindow } from 'electron'
import {
  PortConfig,
  PortListItem,
  PortState,
  SerialResult,
  SerialSnapshot
} from '@shared/dtos/connection/serial-com-port.dto'
import { ParsedReading, PARSERS } from './serial-parser'

@singleton()
export class SerialComPortService {
  private ports = new Map<string, SerialPort>() // open ports

  private states = new Map<string, PortState>() // what the UI shows

  private readings = new Map<string, { value: string | number; at: number; path: string }>()

  private buffers = new Map<string, string>() // half-received line per port

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
    const win = this.getWindow()
    if (win && !win.isDestroyed()) win.webContents.send('serial:snapshot', this.getSnapshot())
  }

  private setState(path: string, patch: Partial<PortState>) {
    const prev = this.states.get(path)

    this.states.set(path, { path, parserType: 'raw', status: 'disconnected', ...prev, ...patch })

    this.push()
  }

  // call after a save so old FAT/SNF/CLR can't be reused

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

  // data arrives in pieces ("12" then ".5\r\n"): join them into complete lines

  private onData(path: string, chunk: Buffer) {
    const lines = ((this.buffers.get(path) ?? '') + chunk.toString('ascii')).split(/\r\n|\n|\r/)

    this.buffers.set(path, (lines.pop() ?? '').slice(-1024)) // unfinished last piece, capped

    for (const line of lines) this.onLine(path, line.trim())
  }

  private onLine(path: string, line: string) {
    if (!line) return

    let data: ParsedReading | null = null

    try {
      data = PARSERS[this.states.get(path)?.parserType ?? 'raw'].parse(line)
    } catch {
      /* bad line: ignore */
    }

    if (data) {
      const at = Date.now()

      for (const [key, value] of Object.entries(data)) this.readings.set(key, { value, at, path })
    }

    this.setState(path, { lastLine: line, lastLineParsed: data !== null })
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

    for (const s of this.states.values()) {
      if (s.path !== cfg.path && cfg.parserType !== 'raw' && s.parserType === cfg.parserType) {
        return { ok: false, error: `${s.path} is already connected as ${cfg.parserType}` }
      }
    }

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
      await new Promise<void>((resolve, reject) => p.open((err) => (err ? reject(err) : resolve())))
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }

    this.ports.set(cfg.path, p)

    this.setState(cfg.path, { parserType: cfg.parserType, status: 'connected', error: undefined })

    return { ok: true }
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

  // app quit

  async shutdown() {
    await Promise.allSettled([...this.ports.keys()].map((path) => this.disconnect(path)))
  }
}
