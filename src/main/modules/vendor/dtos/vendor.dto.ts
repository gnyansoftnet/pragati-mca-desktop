import { PaginatedResponseDto } from "../../../utils/pagination.dto";

export interface VendoreDto {
  id: number;
  dskName: string;
  dskCode: string;
  vendorCode: string;
  mobileNumber?: string|null;
  routeCode?: string|null;
  supervisorEmpId?: string|null;
}

export type PaginatedVendorsDto = PaginatedResponseDto<VendoreDto>;