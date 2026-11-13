export interface ApiVendor {
  id: string
  plant: string
  dsk_code: string
  dsk_name: string
  vendor: string
  mobile_no: string | null
  date: string | null
  route_code: string
  supervisor_emp_id: string
  source_type: string
  created_at: string
  created_by: string
  modified_at: string
  modified_by: string
  branch_code: string
  org_code: string
  dFlag: number
}

export interface VendorListResponse {
  success: boolean
  message: string
  data: ApiVendor[]
}

// Only what we save
export interface Vendor {
  id: string
  plant: string
  dsk_code: string
  dsk_name: string
  vendor: string
  mobile_no: string | null
  date: string | null
  route_code: string
  supervisor_emp_id: string
  source_type: string
  created_at: string
  created_by: string
  modified_at: string
  modified_by: string
  branch_code: string
  org_code: string
  dFlag: number
}

export interface SyncVendor {
  success: number
  message: string
  total: number
}
