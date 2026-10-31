import { injectable, inject } from "tsyringe";
import { PaginationRequestDto } from "../../../utils/pagination.dto";
import { MilkCollectionRepo } from "../repositories/milk-collection.repo";
import { PaginatedMilkCollectionDto } from "../dtos/milk-collection.dto";
import { SaveMilkCollectionDto } from "../dtos/milk-collection-save.dt";





@injectable()
export class MilkCollectionService {
  constructor(
    @inject(MilkCollectionRepo)
    private readonly milkRepo: MilkCollectionRepo
  ) {}

  async getPaginatedMilkCollctions(data:PaginationRequestDto):Promise<PaginatedMilkCollectionDto>{
        if (data.page <= 0) throw new Error("Page must be greater than 0");
        if (data.limit <= 0) throw new Error("Limit must be greater than 0");
        return await this.milkRepo.getPaginatedMilkCollctions(data);
  }

  async saveMilkCollection(data:SaveMilkCollectionDto):Promise<any>{
    return await this.milkRepo.saveMilkCollection(data);
  }
  
}