import 'reflect-metadata'
import { container } from 'tsyringe'
import { TOKENS } from './token'
import { VendorSyncRepo } from '../../modules/sync/repo/impl/vendor-sync.repo'
import { VendorSyncService } from '../../modules/sync/service/impl/vendor-sync.service'
import { SerialComPortService } from '../../modules/machine/service/serial-com-port.service'
import { TokenService } from '../../modules/user/service/token.service'
import { ApiService } from '../../utils/api-service'
import { MilkRejectionRepo } from '../../modules/procurement/repo/impl/milk-rejection.repo'
import { MilkRejectionService } from '../../modules/procurement/service/impl/milk-rejection.service'
import { PasswordService } from '../../modules/user/service/password.service'
import { MilkAnalysisService } from '../../modules/procurement/service/impl/milk-analysis.service'
import { MilkAnalysisRepo } from '../../modules/procurement/repo/impl/milk-analysis.repo'
import { RouteRepo } from '../../modules/route/repositories/impl/route.repo'
import { RouteService } from '../../modules/route/services/impl/route.service'
import { VendorService } from '../../modules/vendor/services/impl/vendor.service'
import { ProcurmentSyncRepo } from '../../modules/sync/repo/impl/procurement-sync.repo'
import { ProcurmentSyncService } from '../../modules/sync/service/impl/procurement-sync.service'

import { SupervisorSyncRepo } from '../../modules/sync/repo/impl/supervisor-sync.repo'
import { SupervisorSyncService } from '../../modules/sync/service/impl/supervisor-sync.service'

import { RouteSyncRepo } from '../../modules/sync/repo/impl/route-sync.repo'

import { RouteSyncService } from '../../modules/sync/service/impl/route-sync.service'
import { VendorRepo } from '../../modules/vendor/repositories/impl/vendor.repo'
import { SupervisorService } from '../../modules/supervisor/service/impl/supervisor.service'
import { SupervisorRepo } from '../../modules/supervisor/repo/impl/supervisor.repo'
import { MilkCollectionRepo } from '../../modules/procurement/repo/impl/milk-collection.repo'
import { MilkCollectionService } from '../../modules/procurement/service/impl/milk-collection.service'
import { TransportRepo } from '../../modules/transport/repo/impl/transport.repo'
import { TransportService } from '../../modules/transport/service/impl/transport.service'
import { MasterRepo } from '../../modules/master/repo/impl/master.repo'
import { MasterService } from '../../modules/master/service/impl/master.service'
import { ReportRepo } from '../../modules/reports/repo/impl/report.repo'
import { ReportService } from '../../modules/reports/service/impl/report.service'
import { UserSyncService } from '../../modules/sync/service/impl/user-sync.service'
import { UserSyncRepo } from '../../modules/sync/repo/impl/user-sync.repo'
import { UserRepo } from '../../modules/user/repo/impl/user.repo'
import { UserService } from '../../modules/user/service/impl/user.service'

export function bootstrapContainer(): void {
  container.registerSingleton(SerialComPortService)
  container.registerSingleton(PasswordService)
  container.registerSingleton(ApiService)
  container.registerSingleton(TokenService)

  container.registerSingleton(TOKENS.UserRepo, UserRepo)
  container.registerSingleton(TOKENS.UserService, UserService)

  container.registerSingleton(TOKENS.UserSyncService, UserSyncService)
  container.registerSingleton(TOKENS.UserSyncRepo, UserSyncRepo)

  container.registerSingleton(TOKENS.VendorRepo, VendorRepo)
  container.registerSingleton(TOKENS.VendorService, VendorService)

  container.registerSingleton(TOKENS.VendorSyncRepo, VendorSyncRepo)
  container.registerSingleton(TOKENS.VendorSyncService, VendorSyncService)

  container.registerSingleton(TOKENS.RouteRepo, RouteRepo)
  container.registerSingleton(TOKENS.RouteService, RouteService)

  container.registerSingleton(TOKENS.RouteSyncRepo, RouteSyncRepo)
  container.registerSingleton(TOKENS.RouteSyncService, RouteSyncService)

  container.registerSingleton(TOKENS.SupervisorRepo, SupervisorRepo)
  container.registerSingleton(TOKENS.SupervisorService, SupervisorService)

  container.registerSingleton(TOKENS.SupervisorSyncRepo, SupervisorSyncRepo)
  container.registerSingleton(TOKENS.SupervisorSyncService, SupervisorSyncService)

  container.registerSingleton(TOKENS.ProSyncRepo, ProcurmentSyncRepo)
  container.registerSingleton(TOKENS.ProSyncService, ProcurmentSyncService)

  container.registerSingleton(TOKENS.MilkAnalysisRepo, MilkAnalysisRepo)
  container.registerSingleton(TOKENS.MilkAnalysisService, MilkAnalysisService)

  container.registerSingleton(TOKENS.MilkCollectionRepo, MilkCollectionRepo)
  container.registerSingleton(TOKENS.MilkCollectionService, MilkCollectionService)

  container.registerSingleton(TOKENS.MilkRejectionRepo, MilkRejectionRepo)
  container.registerSingleton(TOKENS.MilkRejectionService, MilkRejectionService)

  container.registerSingleton(TOKENS.TransportRepo, TransportRepo)
  container.registerSingleton(TOKENS.TransportService, TransportService)

  container.registerSingleton(TOKENS.MasterRepo, MasterRepo)
  container.registerSingleton(TOKENS.MasterService, MasterService)
}
container.registerSingleton(TOKENS.ReportRepo, ReportRepo)
container.registerSingleton(TOKENS.ReportService, ReportService)

export { container }
