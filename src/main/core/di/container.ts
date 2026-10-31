import 'reflect-metadata'
import { container } from 'tsyringe'
import { UserRepository } from '../../modules/user/repositories/user.repo'
import { UserService } from '../../modules/user/services/user.service'
import { UserController } from '../../modules/user/controllers/user.controller'
import { RouteRepo } from '../../modules/route/repositories/route.repo'
import { RouteService } from '../../modules/route/services/route.service'
import { VendorRepo } from '../../modules/vendor/repositories/vendor.repo'
import { VendorService } from '../../modules/vendor/services/vendor-service'
import { MilkCollectionRepo } from '../../modules/milk_collection/repositories/milk-collection.repo'
import { MilkCollectionService } from '../../modules/milk_collection/services/milk-collection.service'

container.registerSingleton(UserRepository)
container.registerSingleton(UserService)
container.registerSingleton(UserController)
// route
container.registerSingleton(RouteRepo)
container.registerSingleton(RouteService)

// vendor
container.registerSingleton(VendorRepo)
container.registerSingleton(VendorService)


// milk-collection
container.registerSingleton(MilkCollectionRepo)
container.registerSingleton(MilkCollectionService)




export { container }
