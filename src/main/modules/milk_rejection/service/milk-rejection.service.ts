import { injectable, inject } from 'tsyringe'
import { PaginationRequestDto } from '../../../utils/pagination.dto'
import { MilkRejectionRepo } from '../repo/milk-rejection.repo'
import {
  MilkRejectionResponseDto,
  MilkRejectionSaveDto,
  PaginatedMilkRejectionDto,
  ReasonDto
} from '../dtos/milk-rejection.dto'

@injectable()
export class MilkRejectionService {
  constructor(
    @inject(MilkRejectionRepo)
    private readonly milkRejectionRepo: MilkRejectionRepo
  ) {}

  async getPaginatedMilkRejections(data: PaginationRequestDto): Promise<PaginatedMilkRejectionDto> {
    if (data.page <= 0) throw new Error('Page must be greater than 0')
    if (data.limit <= 0) throw new Error('Limit must be greater than 0')
    return await this.milkRejectionRepo.getPaginatedMilkRejections(data)
  }

  async saveMilkRejection(data: MilkRejectionSaveDto): Promise<MilkRejectionResponseDto> {
    return await this.milkRejectionRepo.saveMilkRejection(data)
  }

  async getReasons(): Promise<ReasonDto[]> {
    return await this.milkRejectionRepo.getReasons()
  }
}
