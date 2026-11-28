export const TOKENS = {
  // user 
  UserService: Symbol('UserService'),
  UserRepo: Symbol('UserRepo'),
  // user sync
  UserSyncService: Symbol('UserSyncService'),
  UserSyncRepo: Symbol('UserSyncRepo'),

  // vendor
  VendorService: Symbol('VendorService'),
  VendorRepo: Symbol('VendorRepo'),

  // vendorSync
  VendorSyncService: Symbol('VendorSyncService'),
  VendorSyncRepo: Symbol('VendorSyncRepo'),

  // supervisor sync
  SupervisorSyncService: Symbol('SupervisorSyncService'),
  SupervisorSyncRepo: Symbol('SupervisorSyncRepo'),

  // supervisor
  SupervisorService: Symbol('SupervisorService'),
  SupervisorRepo: Symbol('SupervisorRepo'),

  // route sync
  RouteSyncService: Symbol('RouteSyncService'),
  RouteSyncRepo: Symbol('RouteSyncRepo'),

  // route sync
  RouteService: Symbol('RouteService'),
  RouteRepo: Symbol('RouteRepo'),

  // procurement sync
  ProSyncService: Symbol('ProSyncService'),
  ProSyncRepo: Symbol('ProSyncRepo'),

  // milk analysis
  MilkAnalysisService: Symbol('MilkAnalysisService'),
  MilkAnalysisRepo: Symbol('MilkAnalysisRepo'),

  // milk collection
  MilkCollectionService: Symbol('MilkCollectionService'),
  MilkCollectionRepo: Symbol('MilkCollectionRepo'),

  // milk rejection
  MilkRejectionService: Symbol('MilkRejectionService'),
  MilkRejectionRepo: Symbol('MilkRejectionRepo'),

  // transport
  TransportService: Symbol('TransportService'),
  TransportRepo: Symbol('TransportRepo'),

  // master
  MasterService: Symbol('MasterService'),
  MasterRepo: Symbol('MasterRepo'),

  // reports
  ReportService: Symbol('ReportService'),
  ReportRepo: Symbol('ReportRepo')
} as const
