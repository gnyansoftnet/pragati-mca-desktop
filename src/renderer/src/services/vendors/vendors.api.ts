import type { Vendor } from "../../types/vendors/vendors.types";
import type { PaginatedResponse } from "../../types/common.types";

const vendorsApi = {
  getAll: (): Promise<Vendor[]> => {
    return window.api.getVendors();
  },

  getPaginated: (
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Vendor>> => {
    return window.api.getPaginatedVendors({
      page,
      limit,
    });
  },
};

export default vendorsApi;