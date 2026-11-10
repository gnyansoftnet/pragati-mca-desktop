// import { ipcMain } from 'electron'
// import { container } from '../../core/di/container'
// import { SaveMilkCollectionDto } from '@shared/dtos/milk-collection/milk-collection.dto'
// import { MilkCollectionBackupService } from './service/milk-collection-backup.service'

// const service = container.resolve(MilkCollectionBackupService)

// export function registerBackupIpc(): void {
//   ipcMain.handle('backup:getMilkCollectionsByDate', (_event, fromDate: string, toDate: string) =>
//     service.getMilkCollectionsByDate(fromDate, toDate)
//   )

//   ipcMain.handle('milk-collection:getWeightSystems', () => service.getWeightSystems())

//   ipcMain.handle('milk-collection:getMilkCollections', () => service.getMilkCollections())

//   ipcMain.handle('milk-collection:saveMilkCollection', (_event, params: SaveMilkCollectionDto) =>
//     service.saveMilkCollection(params)
//   )
// }
