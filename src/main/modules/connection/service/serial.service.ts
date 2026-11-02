import { singleton } from 'tsyringe'
import { SerialPort } from 'serialport'
import type { BrowserWindow } from 'electron'
import { SerialConnectDto, SerialResultDto } from '../dtos/serial.dto'
import { parseWeight } from '../../../utils/parse-weight'

@singleton()
export class SerialService {
  private port: SerialPort | null = null
  private buffer = ''
  private getWindow: () => BrowserWindow | null = () => null

  setWindowGetter(getter: () => BrowserWindow | null): void {
    this.getWindow = getter
  }

  async listPorts() {
    return SerialPort.list()
  }

  async connect(raw: Record<string, unknown>): Promise<SerialResultDto> {
    try {
      const cfg = this.normalize(raw)
      await this.disconnect()
      this.buffer = ''

      const p = new SerialPort({ ...cfg, autoOpen: false })
      await new Promise<void>((resolve, reject) =>
        p.open((err) => (err ? reject(err) : resolve()))
      )

      this.port = p
      p.on('data', (chunk: Buffer) => this.handleData(chunk))
      p.on('error', (e) => this.send('serial:error', e.message))
      p.on('close', () => this.send('serial:status', 'disconnected'))

      this.send('serial:status', 'connected')
      return { ok: true }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.port || !this.port.isOpen) return resolve()
      this.port.removeAllListeners()
      this.port.close(() => {
        this.send('serial:status', 'disconnected')
        resolve()
      })
    })
  }

  private handleData(chunk: Buffer): void {
    this.buffer += chunk.toString('ascii')
    const frames = this.buffer.split(/\r?\n|\r/)
    this.buffer = frames.pop() ?? ''
    for (const f of frames) {
      if (f.trim()) this.send('serial:weight', parseWeight(f))
    }
  }

  private send(channel: string, data: unknown): void {
    this.getWindow()?.webContents.send(channel, data)
  }

  private normalize(raw: Record<string, unknown>): SerialConnectDto {
    const path = String(raw.path ?? '').trim()
    const baudRate = Number(raw.baudRate)
    const parity = String(raw.parity ?? 'none').toLowerCase()
    const dataBits = Number(raw.dataBits)
    const stopBits = Number(raw.stopBits)

    if (!path) throw new Error('Port name is required.')
    if (!Number.isInteger(baudRate) || baudRate <= 0) throw new Error('Invalid baud rate.')
    if (!['none', 'even', 'odd', 'mark', 'space'].includes(parity)) throw new Error('Invalid parity.')
    if (![5, 6, 7, 8].includes(dataBits)) throw new Error('Data bits must be 5 to 8.')
    if (![1, 1.5, 2].includes(stopBits)) throw new Error('Stop bits must be 1, 1.5 or 2.')

    return {
      path,
      baudRate,
      parity: parity as SerialConnectDto['parity'],
      dataBits: dataBits as SerialConnectDto['dataBits'],
      stopBits: stopBits as SerialConnectDto['stopBits']
    }
  }
}