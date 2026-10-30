import { injectable, inject } from 'tsyringe'
import { UserService } from '../services/user.service'
import { CreateUserDto, UpdateUserDto } from '../dto/user.types'

@injectable()
export class UserController {
  constructor(
    @inject(UserService)
    private readonly userService: UserService
  ) {}

  getAll() {
    return this.userService.getAllUsers()
  }

  getById(id: number) {
    return this.userService.getUserById(id)
  }

  create(data: CreateUserDto) {
    return this.userService.createUser(data)
  }

  update(id: number, data: UpdateUserDto) {
    return this.userService.updateUser(id, data)
  }

  delete(id: number) {
    return this.userService.deleteUser(id)
  }
}
