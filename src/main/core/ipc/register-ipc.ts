import { registerMilkAnalysisIpc } from '../../modules/analysis/milk-analysis.ipc'
import { registerSerialIpc } from '../../modules/connection/serial.ipc'
import { registerMilkCollectionIpc } from '../../modules/milk_collection/milk-collection.ipc'
import { registerRouteIpc } from '../../modules/route/route.ipc'
import { registerVendorIpc } from '../../modules/vendor/vendor-ipc'

export function registerIpcHandlers(): void {
  registerRouteIpc()
  registerVendorIpc()
  registerMilkCollectionIpc()
  registerMilkAnalysisIpc()
  registerSerialIpc()
}
