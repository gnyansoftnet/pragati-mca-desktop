import { ipcMain } from "electron";
import { container } from "../../core/di/container";
import { PaginationRequestDto } from "../../utils/pagination.dto";
import { MilkCollectionService } from "./services/milk-collection.service";

const service = container.resolve(MilkCollectionService);

export function registerMilkCollectionIpc(): void {


  ipcMain.handle("milk-collection:getPaginatedMilkCollctions", (_event, params: PaginationRequestDto) =>
    service.getPaginatedMilkCollctions(params)
  );

}