export interface ApiSupervisor {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  contact_no: string
  changed_on: string
  plant: string
  source_type: string
  created_at: string
  created_by: string
  modified_at: string
  modified_by: string
  branch_code: string
  org_code: string
  dFlag: number
}

export interface SupervisorListResponse {
  success: boolean
  message: string
  data: ApiSupervisor[]
}

export interface Supervisor {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  contact_no: string
  changed_on: string
  plant: string
  source_type: string
  created_at: string
  created_by: string
  modified_at: string
  modified_by: string
  branch_code: string
  org_code: string
  dFlag: number
}
