import { PermissionRow } from '../dto/permission.row'
import { PagedUserRows, UserRow } from '../dto/user.rows'

export interface IUserRepo {
  usersExist(): Promise<boolean>
  findByUserName(userName: string): Promise<UserRow | undefined>
  getPaginatedUsers(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedUserRows>
  getMenu(userId: number): Promise<PermissionRow[]>
}
