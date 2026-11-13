import type { SupervisorRow, PagedSupervisorRows } from '../dto/supervisor.rows'

export interface ISupervisorRepo {
  getSupervisors(): Promise<SupervisorRow[]>
  getPaginatedSupervisors(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<PagedSupervisorRows>
}
