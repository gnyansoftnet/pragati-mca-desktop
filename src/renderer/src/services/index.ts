import routesApi from './routes/routes.api'
import vendorsApi from './vendors/vendors.api'
import supervisorsApi from './supervisors/supervisors.api'
import analysisApi from './analysis/milk-analysis.api'
import collectionApi from './collections/milk-collections.api'
import rejectionApi from './rejection/rejection.api'

const api = {
  routes: routesApi,
  vendors: vendorsApi,
  supervisors: supervisorsApi,
  sample: analysisApi,
  collection: collectionApi,
  rejection: rejectionApi,
}

export default api
