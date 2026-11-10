// import { injectable } from 'tsyringe'
// import { db } from '../../../core/config/database.config'
// import { UserRow } from './user.rows'

// const SQL_FIND_USER_BY_NAME = `
//   SELECT id, user_name, user_code, password, plant, role
//     FROM \`user\`
//    WHERE user_name = ?
//    LIMIT 1`

// @injectable()
// export class UserRepo {
//   async findByUserName(userName: string): Promise<UserRow | undefined> {
//     const [rows] = await db.execute<UserRow[]>(SQL_FIND_USER_BY_NAME, [userName])
//     return rows[0]
//   }
// }
