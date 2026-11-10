import { injectable, inject } from 'tsyringe'
import type { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import type { PaginatedVendorsDto, VendoreResponseDto } from '@shared/dtos/vendor/vendor.dto'
import { VendorRepo } from '../repositories/vendor.repo'
import { AppError, DatabaseError } from '../../../utils/app-errors'
import { VendorSyncService } from './vendor-sync.service'
import { SyncVendor } from '../dto/vendor-api-response'
import { SyncSucess } from '@shared/dtos/sync-success.dto'

@injectable()
export class VendorService {
  constructor(
    @inject(VendorRepo) private readonly vendorRepo: VendorRepo,
    @inject(VendorSyncService)
    private readonly vendorApi: VendorSyncService
  ) {}

  async getVendors(): Promise<VendoreResponseDto[]> {
    try {
      const rows = await this.vendorRepo.getVendors()
      return rows.map((r) => ({
        id: r.id,
        dskCode: r.dsk_code,
        dskName: r.dsk_name,
        vendorCode: r.vendor_code
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch vendors', { cause: error })
    }
  }

  async getVendorsByRoute(routeCode: string): Promise<VendoreResponseDto[]> {
    try {
      const rows = await this.vendorRepo.getVendorsByRoute(routeCode)
      return rows.map((r) => ({
        id: r.id,
        dskCode: r.dsk_code,
        dskName: r.dsk_name,
        vendorCode: r.vendor_code
      }))
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch vendors', { cause: error })
    }
  }

  async getPaginatedVendors(data: PaginationRequestDto): Promise<PaginatedVendorsDto> {
    const page = Math.max(1, Math.trunc(Number(data.page)) || 1)
    const limit = Math.max(1, Math.trunc(Number(data.limit)) || 10)
    const offset = (page - 1) * limit
    const search = data.search?.trim() || undefined

    try {
      const { rows, total } = await this.vendorRepo.getPaginatedVendors(search, limit, offset)
      const totalPages = Math.ceil(total / limit)

      return {
        data: rows.map((r) => ({
          id: r.id,
          dskCode: r.dsk_code,
          dskName: r.dsk_name,
          vendorCode: r.vendor_code,
          mobileNumber: r.mobile_number,
          routeCode: r.route_code,
          supervisorEmpId: r.supervisor_emp_id
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to fetch vendors', { cause: error })
    }
  }

  async saveVendors(plant: string, org: string, branch: string): Promise<SyncSucess> {
    try {
      const vendors = await this.vendorApi.syncDownVendors(plant, org, branch)
      const row = await this.vendorRepo.saveVendors(vendors)
      return {
        success: Number(row.success),
        message: row.message,
        total: Number(row.total)
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new DatabaseError('Failed to save routes', { cause: error })
    }
  }
}
