import routesApi from './routes/routes.api'
import vendorsApi from './vendors/vendors.api'
import supervisorsApi from './supervisors/supervisors.api'
import analysisApi from './analysis/milk-analysis.api'

const api = {
  routes: routesApi,
  vendors: vendorsApi,
  supervisors: supervisorsApi,
  sample: analysisApi
}

export default api
