import { injectable, inject } from 'tsyringe'
import { PortConnectionRepo } from '../repo/port-connection.repo'
import {
  CreatePortConnectionDto,
  PortConnectionDto,
  UpdatePortConnectionDto
} from '../dtos/port-connection.dto'

@injectable()
export class PortConnectionService {
  constructor(
    @inject(PortConnectionRepo)
    private readonly portRepo: PortConnectionRepo
  ) {}

  async getConnectionPorts(): Promise<PortConnectionDto[]> {
    return this.portRepo.getConnectionPorts()
  }

  async createPort(data: CreatePortConnectionDto): Promise<PortConnectionDto> {
    return this.portRepo.createPort(data)
  }

  async updatePort(id: number, data: UpdatePortConnectionDto): Promise<PortConnectionDto> {
    const existingPort = await this.portRepo.findById(id)

    if (!existingPort) {
      throw new Error('port not found.')
    }

    const updatedPort = await this.portRepo.updatePort(id, data)

    if (!updatedPort) {
      throw new Error('Unable to update port.')
    }

    return updatedPort
  }
}
