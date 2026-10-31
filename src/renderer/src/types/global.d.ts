import type { Route } from "./routes.types";
import type { Vendor } from "./vendors.types";
import type { PaginatedResponse } from "./common.types";

declare global {
  interface Window {
    api: {
      // Routes
      getRoutes: () => Promise<Route[]>;

      getPaginatedRoutes: (params: {
        page: number;
        limit: number;
      }) => Promise<PaginatedResponse<Route>>;

      // Vendors
      getVendors: () => Promise<Vendor[]>;

      getPaginatedVendors: (params: {
        page: number;
        limit: number;
      }) => Promise<PaginatedResponse<Vendor>>;
    };
  }
}

export {};