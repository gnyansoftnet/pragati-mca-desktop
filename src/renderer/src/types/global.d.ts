import type { Route } from './routes.types'
import type { Vendor } from './vendors.types'
import type { MilkSample, UpdateMilkSamplePayload } from './analysis/milk-analysis.types'
import type { Supervisor } from './supervisors.types'
import type { PaginatedResponse } from './common.types'
import { SerialConnectDto, SerialResultDto } from '@shared/dtos/connection/serial.dto'
import { PortListItem, SerialSnapshot } from '@shared/dtos/connection/serial-com-port.dto'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'

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
      getVendorsByRoute: (params: { routeCode: string }) => Promise<Vendor[]>
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
      // getSerialPorts: () => Promise<{ path: string }[]>
      connectSerial: (params: SerialConnectDto) => Promise<SerialResultDto>
      // disconnectSerial: () => Promise<void>
      onSerialData: (cb: (text: string) => void) => () => void

      //get serial ports
      getSerialPorts: () => Promise<PortListItem[]>
      getSnapshot: () => Promise<SerialSnapshot>
      onSerialSnapshot: (cb: (s: SerialSnapshot) => void) => () => void
      disconnectSerial: (path: string) => Promise<SerialResult>

      // Milk Samples & Analysis
      getMilkSamples: (date: string, shift: number, plant: string) => Promise<MilkSampleDto[]>
      updateMilkSample: (payload: MilkSampleUpdateDto) => Promise<MilkSampleDto>
    }
  }
}

export {}
