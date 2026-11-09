import 'reflect-metadata'
import { container } from 'tsyringe'
import { RouteRepo } from '../../modules/route/repositories/route.repo'
import { RouteService } from '../../modules/route/services/route.service'
import { VendorRepo } from '../../modules/vendor/repositories/vendor.repo'
import { VendorService } from '../../modules/vendor/services/vendor-service'
import { MilkCollectionRepo } from '../../modules/milk_collection/repositories/milk-collection.repo'
import { MilkCollectionService } from '../../modules/milk_collection/services/milk-collection.service'
import { MilkAnalysisRepo } from '../../modules/analysis/repo/milk-analysis.repo'
import { MilkAnalysisService } from '../../modules/analysis/service/milk-analysis.service'
import { SupervisorRepo } from '../../modules/supervisor/repo/supervisor.repo'
import { SupervisorService } from '../../modules/supervisor/service/supervisor.service'
import { MilkRejectionRepo } from '../../modules/milk_rejection/repo/milk-rejection.repo'
import { MilkRejectionService } from '../../modules/milk_rejection/service/milk-rejection.service'
import { PasswordService } from '../../modules/user/service/password.service'
import { UserRepo } from '../../modules/user/repo/user.repo'
import { UserService } from '../../modules/user/service/user.service'
import { SerialComPortService } from '../../modules/machine/service/serial-com-port.service'
import { ApiService } from '../../utils/api-service'
import { VendorSyncService } from '../../modules/vendor/services/vendor-sync.service'
import { RouteSyncService } from '../../modules/route/services/route-sync.service'
import { TokenService } from '../../modules/user/service/token.service'
import { UserSyncService } from '../../modules/user/service/user-sync.service'

// route
container.registerSingleton(RouteRepo)
container.registerSingleton(RouteService)

// vendor
container.registerSingleton(VendorRepo)
container.registerSingleton(VendorService)

// milk-collection
container.registerSingleton(MilkCollectionRepo)
container.registerSingleton(MilkCollectionService)

// milk-analysis
container.registerSingleton(MilkAnalysisRepo)
container.registerSingleton(MilkAnalysisService)

// serial port
container.registerSingleton(SerialComPortService)

// supervisor
container.registerSingleton(SupervisorRepo)
container.registerSingleton(SupervisorService)

// milkRejection
container.registerSingleton(MilkRejectionRepo)
container.registerSingleton(MilkRejectionService)

// password
container.registerSingleton(PasswordService)
// user
container.registerSingleton(UserRepo)
container.registerSingleton(UserService)

// serial port
container.registerSingleton(SerialComPortService)
// api client
container.registerSingleton(ApiService)
// vendor api aync
container.registerSingleton(VendorSyncService)
// rout api sync
container.registerSingleton(RouteSyncService)
// token
container.registerSingleton(TokenService)
// user sync
container.registerSingleton(UserSyncService)

export { container }
