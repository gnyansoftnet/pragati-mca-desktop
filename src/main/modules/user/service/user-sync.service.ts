import { injectable } from 'tsyringe'
import { Url } from '../../../core/constants/url'
import { ApiService } from '../../../utils/api-service'
import { ExternalApiError } from '../../../utils/app-errors'
import { User, UserListResponse } from '../dto/user-api-response'

@injectable()
export class UserSyncService {
  constructor(private readonly api: ApiService) {}

  async syncDownUsers(plant: string): Promise<User[]> {
    const { data } = await this.api.http.get<UserListResponse>(Url.user, {
      params: {
        plant: plant
      }
    })
    console.log(data.data)
    if (!data.success) {
      throw new ExternalApiError(`User API failed: ${data.message}`)
    }

    return data.data.map((u): User => ({
      userId: u.userId,
      plantId: u.plantId,
      userName: u.userName,
      userCode: u.userCode,
      status: u.status,
      fullName: u.fullName,
      email: u.email,
      password: u.password,
      phoneNumber: u.phoneNumber,
      dFlag: u.dFlag,
      modifiedDate: u.modifiedDate,
      assignments: u.userOrgBranches.map((uob) => ({
        id: uob.id,
        orgId: uob.organisation.orgId,
        orgCode: uob.organisation.orgCode,
        branchId: uob.branch.branchId,
        branchCode: uob.branch.branchCode,
        roleId: uob.role.roleId,
        roleName: uob.role.roleName
      }))
    }))
  }
}
