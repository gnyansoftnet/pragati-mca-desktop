import { ipcMain } from 'electron'
import { container } from '../../core/di/container'
import { UserService } from './service/user.service'

const service = container.resolve(UserService)

export function registerUserIpc(): void {
  ipcMain.handle('user:login', (_event, userName: string, password: string) =>
    service.login(userName, password)
  )
  ipcMain.handle('user:syncUser', (_event, plant: string) => service.saveUsers(plant))
  ipcMain.handle('user:usersExist', (_event): Promise<boolean> => service.usersExist())
}
