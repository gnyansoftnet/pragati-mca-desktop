import { ipcMain } from "electron";
import { container } from "../../core/di/container";
import { PaginationRequestDto } from "../../utils/pagination.dto";
import { MilkCollectionService } from "./services/milk-collection.service";
import { SaveMilkCollectionDto } from "./dtos/milk-collection-save.dt";

const service = container.resolve(MilkCollectionService);

export function registerMilkCollectionIpc(): void {


  ipcMain.handle("milk-collection:getPaginatedMilkCollctions", (_event, params: PaginationRequestDto) =>
    service.getPaginatedMilkCollctions(params)
  );

  ipcMain.handle("milk-collection:saveMilkCollection", (_event, params: SaveMilkCollectionDto) =>
    service.saveMilkCollection(params)
  );

}