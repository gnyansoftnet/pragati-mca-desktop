import { singleton } from 'tsyringe'
import { SerialPort } from 'serialport'
import { BrowserWindow } from 'electron'

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
    parity: string,
    dataBits: number,
    stopBits: number
  ) {
    try {
      await this.disconnect()

      const p = new SerialPort({
        path,
        baudRate,
        parity: parity as any,
        dataBits: dataBits as any,
        stopBits: stopBits as any,
        autoOpen: false
      })

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
    if (this.port?.isOpen) this.port.close()
    this.port = null
  }
}
