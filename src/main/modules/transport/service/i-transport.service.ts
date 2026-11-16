import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import {
  PaginatedTransportDto,
  TransportSaveDto,
  TransportDto
} from '@shared/dtos/transport/transport.dto'

export interface ITransportService {
  getPaginatedTransports(
    data: PaginationRequestDto,
    fromDate?: string,
    toDate?: string
  ): Promise<PaginatedTransportDto>
  saveTransport(data: TransportSaveDto): Promise<TransportDto>
}
