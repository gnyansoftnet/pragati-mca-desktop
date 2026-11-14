export const Url = {
  plantDetails: '/sap/opu/odata/sap/zrmrd_int_srv/plant_detailsSet',
  route: '/api/desktop/getRoutesByPlant',
  vendor: '/api/desktop/getVendorsByPlant',
  transport: '/sap/opu/odata/SAP/ZRMRD_INT_SRV/TruckSheetHeaderSet',
  supervisior: '/api/desktop/getSupervisorsByPlant',
  user: '/api/desktop/getUsersByPlant',
  milkCollection: '/api/desktop/saveMilkCollection',
  milkRejection: '/api/desktop/saveMilkRejection'
} as const
