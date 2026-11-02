// import { ipcMain } from "electron";
// import { container } from "../../core/di/container";
// import { SerialConnectDto } from "./dtos/serial.dto";
// import { SerialService } from "./service/serial.service";

// const service = container.resolve(SerialService);

// export function registerSerialIpc(): void {
//   ipcMain.handle("serial:list", () => service.listPorts());

//   ipcMain.handle("serial:connect", (_event, params: SerialConnectDto) =>
//     service.connect(params)
//   );

//   ipcMain.handle("serial:disconnect", () => service.disconnect());
// }