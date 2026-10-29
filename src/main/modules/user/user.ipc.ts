import { ipcMain } from "electron";
import { container } from "../../core/di/container";
import { UserController } from "./controllers/user.controller";
import { CreateUserDto, UpdateUserDto } from "./dto/user.types";

const controller = container.resolve(UserController);

export function registerUserIpc(): void {
    
  ipcMain.handle("users:getAll", () => controller.getAll());

  ipcMain.handle("users:getById", (_event, id: number) =>
    controller.getById(id)
  );

  ipcMain.handle("users:create", (_event, data: CreateUserDto) =>
    controller.create(data)
  );

  ipcMain.handle(
    "users:update",
    (_event, id: number, data: UpdateUserDto) =>
      controller.update(id, data)
  );

  ipcMain.handle("users:delete", (_event, id: number) =>
    controller.delete(id)
  );
}