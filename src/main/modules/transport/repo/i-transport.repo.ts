import { TransportSaveDto } from '@shared/dtos/transport/transport.dto'
import { PagedTransportRows, TransportRow } from '../dto/transport.row'

export interface ITransportRepo {
  getPaginatedTransports(
    search: string | undefined,
    limit: number,
    offset: number,
    fromDate?: string,
    toDate?: string
  ): Promise<PagedTransportRows>
  saveTransport(data: TransportSaveDto): Promise<TransportRow>
}
