import { Supervisor } from '../dto/supervisor-api-response'
import { SyncSupervisorRow } from '../../supervisor/dto/supervisor.rows'

export interface ISupervisorSyncRepo {
  saveSupervisors(items: Supervisor[]): Promise<SyncSupervisorRow>
}
