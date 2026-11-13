import { ipcMain, net } from 'electron'
import { registerSerialIpc } from '../../modules/machine/serial-com-port.ipc'
import { registerRouteIpc } from '../../modules/route/route.ipc'
import { registerSupervisorIpc } from '../../modules/supervisor/supervisor.ipc'
import { registerUserIpc } from '../../modules/user/user.ipc'
import { registerVendorIpc } from '../../modules/vendor/vendor-ipc'
import { registerSyncIpc } from '../../modules/sync/sync.ipc'
import { registerProcurmentIpc } from '../../modules/procurement/procurement.ipc'

const PROBE_URLS = [
  'https://clients3.google.com/generate_204',
  'https://connectivitycheck.gstatic.com/generate_204'
]

async function checkInternetFromMain(timeoutMs = 3500): Promise<boolean> {
  if (!net.isOnline()) return false

  for (const baseUrl of PROBE_URLS) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await net.fetch(`${baseUrl}?_=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      })

      if (res.ok || res.status === 204) {
        return true
      }
    } catch {
      // Try next probe endpoint quietly without logging to renderer DevTools
    } finally {
      clearTimeout(timer)
    }
  }

  return false
}

export function registerIpcHandlers(): void {
  ipcMain.removeHandler('network:checkInternet')
  ipcMain.handle('network:checkInternet', async () => checkInternetFromMain())
  registerVendorIpc()
  registerRouteIpc()
  registerProcurmentIpc()
  registerSerialIpc()
  registerSupervisorIpc()
  registerUserIpc()
  registerSyncIpc()
}
