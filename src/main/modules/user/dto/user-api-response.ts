export interface ApiOrganisation {
  orgId: number
  orgName: string
  orgShortName: string
  orgCode: string
  orgRegNumber: string | null
  orgGST: string | null
  orgPAN: string | null
  orgGSTINNumber: string | null
  orgFY: string | null
  orgDistrictNumber: string | null
  orgCity: string | null
  orgStateCode: string | null
  orgPin: string | null
  orgPhone: string | null
  orgEmail: string | null
  orgLocation: string | null
  orgLogo: string | null
  address: string | null
  contactNumber: string | null
  createdBy: string | null
  createdDate: string
  modifiedBy: string | null
  modifiedDate: string
  dFlag: boolean
}

export interface ApiBranch {
  branchId: number
  branchName: string
  branchShortName: string
  branchCode: string
  createdBy: string | null
  createdDate: string
  modifiedBy: string | null
  modifiedDate: string
  dFlag: boolean
}

export interface ApiRole {
  roleId: number
  roleName: string
  createdBy: string | null
  createdAt: string
  modifiedBy: string | null
  modifiedAt: string
  dFlag: boolean
}

export interface ApiUserOrgBranch {
  id: number
  organisation: ApiOrganisation
  branch: ApiBranch
  role: ApiRole
}

export interface ApiUser {
  userId: number
  plantId: string | null
  userName: string
  password: string
  userCode: string
  status: string
  fullName: string | null
  email: string | null
  phoneNumber: string | null
  profilePic: string | null
  DOB: string | null
  createdBy: string | null
  createdDate: string
  modifiedBy: string | null
  modifiedDate: string
  dFlag: boolean
  userOrgBranches: ApiUserOrgBranch[]
}

export interface UserListResponse {
  success: boolean
  message: string
  data: ApiUser[]
}

export interface UserAssignment {
  id: number
  orgId: number
  orgCode: string
  branchId: number
  branchCode: string
  roleId: number
  roleName: string
}

export interface User {
  userId: number
  plantId: string | null
  userName: string
  userCode: string
  status: string
  fullName: string | null
  email: string | null
  phoneNumber: string | null
  dFlag: boolean
  password: string
  modifiedDate: string
  assignments: UserAssignment[]
}

export function toUser(api: ApiUser): User {
  return {
    userId: api.userId,
    plantId: api.plantId,
    userName: api.userName,
    userCode: api.userCode,
    status: api.status,
    fullName: api.fullName,
    email: api.email,
    phoneNumber: api.phoneNumber,
    dFlag: api.dFlag,
    password: api.password,
    modifiedDate: api.modifiedDate,
    assignments: api.userOrgBranches.map((uob) => ({
      id: uob.id,
      orgId: uob.organisation.orgId,
      orgCode: uob.organisation.orgCode,
      branchId: uob.branch.branchId,
      branchCode: uob.branch.branchCode,
      roleId: uob.role.roleId,
      roleName: uob.role.roleName
    }))
  }
}
