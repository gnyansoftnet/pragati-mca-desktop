import { singleton } from 'tsyringe'
import { SerialPort } from 'serialport'
import { BrowserWindow } from 'electron'

const PARITY_MAP = {
  0: 'none',
  1: 'odd',
  2: 'even',
  3: 'mark',
  4: 'space'
} as const

@singleton()
export class SerialService {
  private port: SerialPort | null = null
  private getWindow: () => BrowserWindow | null = () => null

  // 1. list available ports
  async listPorts() {
    return SerialPort.list()
  }

  // main gives us the window so we can send data to React
  setWindowGetter(getter: () => BrowserWindow | null) {
    this.getWindow = getter
  }

  // 2. connect
  async connect(
    path: string,
    baudRate: number,
    parity: number, // changed: string -> number
    dataBits: number,
    stopBits: number
  ) {
    try {
      await this.disconnect()

      // changed: convert number -> word for serialport
      const parityWord = PARITY_MAP[parity as keyof typeof PARITY_MAP]
      if (!parityWord) return { ok: false, error: `Invalid parity: ${parity}` }

      const p = new SerialPort({
        path,
        baudRate,
        parity: parityWord,
        dataBits: dataBits as any,
        stopBits: stopBits as any,
        autoOpen: false
      })

      // added: an unhandled 'error' event can crash the main process
      p.on('error', (err) => console.error('Serial error:', err.message))

      await new Promise<void>((resolve, reject) => {
        p.open((err) => (err ? reject(err) : resolve()))
      })

      this.port = p

      // THIS is where the machine data arrives
      p.on('data', (chunk: Buffer) => {
        const text = chunk.toString('ascii')
        const win = this.getWindow()
        if (win && !win.isDestroyed()) win.webContents.send('serial:data', text)
      })

      return { ok: true }
    } catch (e) {
      return { ok: false, error: (e as Error).message }
    }
  }

  // 3. disconnect
  async disconnect() {
    const p = this.port
    this.port = null
    if (!p) return

    p.removeAllListeners('data') // added: stop sending data
    if (p.isOpen) {
      // added: wait until the port is really closed
      await new Promise<void>((resolve) => p.close(() => resolve()))
    }
  }
}
