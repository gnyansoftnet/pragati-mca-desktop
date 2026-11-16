import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '../../../shared/dtos/pagination.dto'

import { TOKENS } from '../../core/di/token'
import { ITransportService } from './service/i-transport.service'
import {
  PaginatedTransportDto,
  TransportSaveDto,
  TransportDto
} from '@shared/dtos/transport/transport.dto'

export function registerTransportIpc(): void {
  const superService = container.resolve<ITransportService>(TOKENS.TransportService)
  ipcMain.handle(
    'transport:saveTransport',
    (_event, data: TransportSaveDto): Promise<TransportDto> => superService.saveTransport(data)
  )

  ipcMain.handle(
    'transport:getPaginatedTransports',
    (
      _event,
      params: PaginationRequestDto,
      fromDate?: string,
      toDate?: string
    ): Promise<PaginatedTransportDto> =>
      superService.getPaginatedTransports(params, fromDate, toDate)
  )
}
