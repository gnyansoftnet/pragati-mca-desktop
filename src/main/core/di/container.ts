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
import { PortConnectionRepo } from '../../modules/connection/repo/port-connection.repo'
import { PortConnectionService } from '../../modules/connection/service/port-connection.service'
import { SerialService } from '../../modules/connection/service/serial.service'
import { SupervisorRepo } from '../../modules/supervisor/repo/supervisor.repo'
import { SupervisorService } from '../../modules/supervisor/service/supervisor.service'
import { MilkRejectionRepo } from '../../modules/milk_rejection/repo/milk-rejection.repo'
import { MilkRejectionService } from '../../modules/milk_rejection/service/milk-rejection.service'

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

// milk-analysis
container.registerSingleton(PortConnectionRepo)
container.registerSingleton(PortConnectionService)

// serial port
container.registerSingleton(SerialService)

// supervisor
container.registerSingleton(SupervisorRepo)
container.registerSingleton(SupervisorService)

// milkRejection
container.registerSingleton(MilkRejectionRepo)
container.registerSingleton(MilkRejectionService)

export { container }
