import { PagedVendorRows, VendorListRow } from '../dto/vendor.rows'

export interface IVendorRepo {
  getVendors(): Promise<VendorListRow[]>
  getVendorsByRoute(routeCode: string): Promise<VendorListRow[]>
  getPaginatedVendors(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedVendorRows>
}
