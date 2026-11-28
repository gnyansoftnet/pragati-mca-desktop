import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { PaginationRequestDto } from '@shared/dtos/pagination.dto'
import { TOKENS } from '../../core/di/token'
import { IUserService } from './service/i-user.service'
import { PermissionDto } from '@shared/dtos/user/permission.dto'

export function registerUserIpc(): void {
  const service = container.resolve<IUserService>(TOKENS.UserService)
  ipcMain.handle('user:login', (_event, userName: string, password: string) =>
    service.login(userName, password)
  )

  ipcMain.handle('user:usersExist', (_event): Promise<boolean> => service.usersExist())
  ipcMain.handle('user:getMenu', (_event, userId: number): Promise<PermissionDto[]> =>
    service.getMenu(userId)
  )

  ipcMain.handle('user:getPaginatedUsers', (_event, params: PaginationRequestDto) =>
    service.getPaginatedUsers(params)
  )
}
