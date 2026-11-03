import bcrypt from 'bcryptjs'
import { injectable, singleton } from 'tsyringe'

const SALT_ROUNDS = 10

@injectable()
@singleton()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
