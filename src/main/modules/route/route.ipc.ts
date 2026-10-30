import { ipcMain } from "electron";
import { container } from "../../core/di/container";
import { RouteService } from "./services/route.service";
import { PaginationRequestDto } from "../../utils/pagination.dto";

const service = container.resolve(RouteService);

export function registerRouteIpc(): void {

  ipcMain.handle("route:getRoutes", () => service.getRoutes());

  ipcMain.handle("route:getPaginatedRoutes", (_event, params: PaginationRequestDto) =>
    service.getPaginatedRoutes(params)
  );

}