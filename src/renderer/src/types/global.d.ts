import type { Route } from './routes.types'
import type { Vendor } from './vendors.types'
import type { Supervisor } from './supervisors.types'
import type { PaginatedResponse } from './common.types'
import { SerialConnectDto, SerialResultDto } from '@shared/dtos/connection/serial.dto'

declare global {
  interface Window {
    api: {
      // Routes
      getRoutes: () => Promise<Route[]>

      getPaginatedRoutes: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<Route>>

      // Vendors
      getVendors: () => Promise<Vendor[]>

      getPaginatedVendors: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<Vendor>>

      // supervisor
      getSupervisors: () => Promise<Supervisor[]>

      getPaginatedSupervisors: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<Supervisor>>

      //gyana
      getSerialPorts: () => Promise<{ path: string }[]>
      connectSerial: (params: SerialConnectDto) => Promise<SerialResultDto>
      disconnectSerial: () => Promise<void>
    }
  }
}

export {}
