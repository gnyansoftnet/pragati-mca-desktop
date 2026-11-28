export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PermissionDto {
  id: number
  pageId: number
  pageName: string
  pageIcon: string | null
  isAccess: boolean
  canRead: boolean
  canWrite: boolean
  canUpdate: boolean
  canDelete: boolean
}

export interface UserDto {
  userId: number
  plantId: string
  userName: string
  password: string
  userCode: string
  status: string
  fullName: string
  email: string
  phoneNumber: string
  profilePic: string | null
  DOB: string | null
  createdBy: string
  createdDate: string
  modifiedBy: string
  modifiedDate: string
  dFlag: boolean
  plantName: string
  orgId: number
  orgCode: string
  branchId: number
  branchCode: string
  roleId: number
  roleName: string
  permissions: PermissionDto[]
}

export type UserListResponseDto = ApiResponse<UserDto[]>
