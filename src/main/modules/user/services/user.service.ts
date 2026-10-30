import { injectable, inject } from 'tsyringe'
import { z } from 'zod'
import { UserRepository } from '../repositories/user.repo'
import { CreateUserDto, UpdateUserDto, User } from '../dto/user.types'

const userSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(20).optional().default('')
})

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll()
  }

  async getUserById(id: number): Promise<User> {
    this.validateId(id)

    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new Error('User not found.')
    }

    return user
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const validatedData = userSchema.parse(data)
    return this.userRepository.create(validatedData)
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    this.validateId(id)

    const validatedData = userSchema.parse(data)

    const existingUser = await this.userRepository.findById(id)

    if (!existingUser) {
      throw new Error('User not found.')
    }

    const updatedUser = await this.userRepository.update(id, validatedData)

    if (!updatedUser) {
      throw new Error('Unable to update user.')
    }

    return updatedUser
  }

  async deleteUser(id: number): Promise<void> {
    this.validateId(id)

    const deleted = await this.userRepository.delete(id)

    if (!deleted) {
      throw new Error('User not found.')
    }
  }

  private validateId(id: number): void {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error('Invalid user ID.')
    }
  }
}
