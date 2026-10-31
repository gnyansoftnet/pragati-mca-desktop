import { registerMilkCollectionIpc } from "../../modules/milk_collection/milk-collection.ipc";
import { registerRouteIpc } from "../../modules/route/route.ipc";
import { registerUserIpc } from "../../modules/user/user.ipc";
import { registerVendorIpc } from "../../modules/vendor/vendor-ipc";

export function registerIpcHandlers(): void {
  registerUserIpc();
  registerRouteIpc();
  registerVendorIpc();
  registerMilkCollectionIpc();

}

