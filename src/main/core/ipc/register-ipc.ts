import { registerUserIpc } from "../../modules/user/user.ipc";

export function registerIpcHandlers(): void {
  registerUserIpc();
}