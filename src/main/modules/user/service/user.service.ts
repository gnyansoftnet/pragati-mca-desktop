import { inject, injectable } from 'tsyringe'
import { PasswordService } from './password.service'
import { UserRepo } from '../repo/user.repo.dto'
import { UserResponseDto } from '@shared/dtos/user/user.dto'

@injectable()
export class UserService {
  constructor(
    @inject(UserRepo) private readonly userRepo: UserRepo,
    @inject(PasswordService) private readonly passwordService: PasswordService
  ) {}

  async login(userName: string, password: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findByUserName(userName)

    if (!user || !(await this.passwordService.compare(password, user.password))) {
      throw new Error('Invalid username or password')
    }

    return {
      id: user.id,
      userName: user.user_name,
      userCode: user.user_code,
      plant: user.plant,
      role: user.role
    }
  }
}
