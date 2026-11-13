import { SyncSucess } from '@shared/dtos/sync-success.dto'
import { Supervisor } from '../dto/supervisor-api-response'

export interface ISupervisorSyncService {
  syncDownSupervisors(plant: string, org: string, branch: string): Promise<Supervisor[]>
  saveSupervisors(plant: string, org: string, branch: string): Promise<SyncSucess>
}
