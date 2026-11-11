import type { Route } from './routes.types'
import type { Vendor } from './vendors.types'
import type { MilkSample, UpdateMilkSamplePayload } from './analysis/milk-analysis.types'
import type { Supervisor } from './supervisors.types'
import type { PaginatedResponse } from './common.types'
import { SerialConnectDto, SerialResultDto } from '@shared/dtos/connection/serial.dto'
import { ReasonDto } from '@shared/dtos/milk-collection/milk-rejection.dto'
import { PortListItem, SerialSnapshot } from '@shared/dtos/connection/serial-com-port.dto'
import { MilkSampleDto, MilkSampleUpdateDto } from '@shared/dtos/milk-collection/milk-sample.dto'
import { MilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
import { UserResponseDto } from '@shared/dtos/user/user.dto'
import { SyncSucess } from '@shared/dtos/sync-success.dto'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto
} from '@shared/dtos/milk-rejection/milk-rejection.dto'

declare global {
  interface Window {
    api: {
      //LOGIN
      login: (userName: string, password: string) => Promise<UserResponseDto>
      syncUser: (plant: string) => Promise<SyncSucess>
      // Routes
      getRoutes: () => Promise<Route[]>
      syncRoutes: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      getPaginatedRoutes: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<Route>>

      // Vendors
      getVendors: () => Promise<Vendor[]>
      syncVendors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
      getVendorsByRoute: (params: { routeCode: string }) => Promise<Vendor[]>
      getPaginatedVendors: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<Vendor>>

      // supervisor
      getSupervisors: () => Promise<Supervisor[]>
      syncSupervisors: (plant: string, org: string, branch: string) => Promise<SyncSucess>
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

      //milk collection
      getMilkCollections: () => Promise<MilkCollectionDto[]>

      //rejection
      getReasons: () => Promise<ReasonDto[]>
      getPaginatedMilkRejections: (params: {
        page: number
        limit: number
        search: string
      }) => Promise<PaginatedResponse<MilkRejectionResponseDto>>
      saveMilkRejection: (params: MilkRejectionSaveDto) => Promise<MilkRejectionResponseDto>
    }
  }
}

export {}
