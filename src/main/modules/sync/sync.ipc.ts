import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { TOKENS } from '../../core/di/token'
import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { IVendorSyncService } from './service/i-vendor-sync.service'
import { IProcurmentSyncService } from './service/i-procurement-sync.service'
import { IRouteSyncService } from './service/i-route-sync.service'
import { ISupervisorSyncService } from './service/i-supervisor-sync.service'
import { IUserSyncService } from './service/i-user-sync.service'

export function registerSyncIpc(): void {
  const userService = container.resolve<IUserSyncService>(TOKENS.UserSyncService)
  const routeService = container.resolve<IRouteSyncService>(TOKENS.RouteSyncService)
  const vendorService = container.resolve<IVendorSyncService>(TOKENS.VendorSyncService)
  const supervisorService = container.resolve<ISupervisorSyncService>(TOKENS.SupervisorSyncService)
  const proService = container.resolve<IProcurmentSyncService>(TOKENS.ProSyncService)

  ipcMain.handle('user-sync:syncUser', (_event, plant: string, intial: string) =>
    userService.saveUsers(plant, intial)
  )
  ipcMain.handle('route-sync:syncRoutes', (_event, plant: string, org: string, branch: string) =>
    routeService.saveRoutes(plant, org, branch)
  )

  ipcMain.handle(
    'vendor-sync:syncVendors',
    (_event, plant: string, org: string, branch: string): Promise<SyncSucess> =>
      vendorService.saveVendors(plant, org, branch)
  )

  ipcMain.handle(
    'supervisor-sync:syncSupervisors',
    (_event, plant: string, org: string, branch: string): Promise<SyncSucess> =>
      supervisorService.saveSupervisors(plant, org, branch)
  )
  ipcMain.handle(
    'procurement-sync:syncMilkCollection',
    (_event, date: string, shift: number): Promise<any> =>
      proService.syncToWebMilkCollection(date, shift)
  )
  ipcMain.handle(
    'procurement-sync:syncMilkRejection',
    (_event, date: string, shift: number): Promise<any> =>
      proService.syncToWebMilkRejection(date, shift)
  )
}
