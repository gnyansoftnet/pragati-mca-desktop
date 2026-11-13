import { injectable } from 'tsyringe'
import { db } from '../../../../core/config/database.config'
import { OperationAction } from '../../../../core/constants/operation-action.enum'
import { DatabaseError } from '../../../../utils/app-errors'
import { Supervisor } from '../../dto/supervisor-api-response'
import { SyncSupervisorRow } from '../../../supervisor/dto/supervisor.rows'
import { ISupervisorSyncRepo } from '../i-supervisor-sync.repo'

@injectable()
export class SupervisorSyncRepo implements ISupervisorSyncRepo {
  constructor() {}
  async saveSupervisors(items: Supervisor[]): Promise<SyncSupervisorRow> {
    const [result] = await db.query<SyncSupervisorRow[][]>('CALL USP_M_SUPERVISOR_SYNC(?, ?)', [
      OperationAction.SYNCDOWN,
      JSON.stringify(items)
    ])

    const row = result?.[0]?.[0]
    if (!row) throw new DatabaseError('Supervisor sync returned no result')
    if (!row.success) throw new DatabaseError(row.message)
    return row
  }
}
