import { registerMilkAnalysisIpc } from '../../modules/analysis/milk-analysis.ipc'
import { registerSerialIpc } from '../../modules/machine/serial-com-port.ipc'
import { registerMilkCollectionIpc } from '../../modules/milk_collection/milk-collection.ipc'
import { registerMilkRejectionIpc } from '../../modules/milk_rejection/milk-rejection.ipc'
import { registerRouteIpc } from '../../modules/route/route.ipc'
import { registerSupervisorIpc } from '../../modules/supervisor/supervisor.ipc'
import { registerUserIpc } from '../../modules/user/user.ipc'
import { registerVendorIpc } from '../../modules/vendor/vendor-ipc'

export function registerIpcHandlers(): void {
  registerRouteIpc()
  registerVendorIpc()
  registerMilkCollectionIpc()
  registerMilkAnalysisIpc()
  registerSerialIpc()
  registerSupervisorIpc()
  registerMilkRejectionIpc()
  registerUserIpc()
}
