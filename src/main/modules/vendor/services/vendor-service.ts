import { inject, injectable } from "tsyringe";
import { VendorRepo } from "../repositories/vendor.repo";
import { PaginatedVendorsDto, VendoreDto } from "../dtos/vendor.dto";
import { PaginationRequestDto } from "../../../utils/pagination.dto";

@injectable()
export class VendorService{
    constructor(
    @inject(VendorRepo)
    private readonly vendorRepo: VendorRepo
  ) {}
  
async getVendors():Promise<VendoreDto[]>{
    return await this.vendorRepo.getVendors(); 
  }

  async getPaginatedVendors(data:PaginationRequestDto):Promise<PaginatedVendorsDto>{
          if (data.page <= 0) throw new Error("Page must be greater than 0");
          if (data.limit <= 0) throw new Error("Limit must be greater than 0");
          return await this.vendorRepo.getPaginatedVendors(data);
    }

}