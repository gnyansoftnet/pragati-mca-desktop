export interface SaveMilkCollectionDto {
  plant: string;
  shift: number;
  tippingTime: string;
  entry: string;
  userCode: string;
  rootCode: string;
  vendorCode: string;
  canType?: string;
  weightSystem?: string;
  milkType?: string ;
  milkStatus?: string ;
  noOfCans?: number;
  grossWeight?: number;
  netWeight?: number;
  netLtr?: number;
  fat?: number;
  snf?: number;
  clr?: number;
}