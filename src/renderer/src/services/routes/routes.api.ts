import type { Route } from "../../types/routes/routes.types";
import type { PaginatedResponse } from "../../types/common.types";

const routesApi = {
  getAll: (): Promise<Route[]> => {
    return window.api.getRoutes();
  },

  getPaginated: (
    page: number,
    limit: number
  ): Promise<PaginatedResponse<Route>> => {
    return window.api.getPaginatedRoutes({
      page,
      limit,
    });
  },
};

export default routesApi;