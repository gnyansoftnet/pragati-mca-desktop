export interface ApiRoute {
  id: string
  plant: string
  route_code: string
  source_type: string
  route_name: string
  act_date: string
  created_at: string
  created_by: string
  modified_at: string
  modified_by: string
  branch_code: string
  org_code: string
  dFlag: number
}

export interface RouteListResponse {
  success: boolean
  message: string
  data: ApiRoute[]
}

export interface Route {
  id: string
  plant: string
  route_code: string
  route_name: string
  act_date: string
  source_type: string
  branch_code: string
  org_code: string
  dFlag: number
  modified_at: string
}
