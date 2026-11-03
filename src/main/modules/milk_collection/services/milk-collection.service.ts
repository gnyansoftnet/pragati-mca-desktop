import { injectable, inject } from 'tsyringe'
import { PaginationRequestDto } from '../../../../shared/dtos/pagination.dto'
import { MilkCollectionRepo } from '../repositories/milk-collection.repo'
import {
  MilkCollectionDto,
  PaginatedMilkCollectionDto
} from '../../../../shared/dtos/milk-collection/milk-collection.dto'
import { SaveMilkCollectionDto } from '../../../../shared/dtos/milk-collection/milk-collection-save.dt'
import { WeightSystemDto } from '../../../../shared/dtos/milk-collection/weight-system.dto'

@injectable()
export class MilkCollectionService {
  constructor(
    @inject(MilkCollectionRepo)
    private readonly milkRepo: MilkCollectionRepo
  ) {}

  async getPaginatedMilkCollctions(
    data: PaginationRequestDto
  ): Promise<PaginatedMilkCollectionDto> {
    if (data.page <= 0) throw new Error('Page must be greater than 0')
    if (data.limit <= 0) throw new Error('Limit must be greater than 0')
    return await this.milkRepo.getPaginatedMilkCollctions(data)
  }

  async saveMilkCollection(data: SaveMilkCollectionDto): Promise<MilkCollectionDto> {
    return await this.milkRepo.saveMilkCollection(data)
  }

  async getWeightSystems(): Promise<WeightSystemDto[]> {
    return await this.milkRepo.getWeightSystems()
  }
}
