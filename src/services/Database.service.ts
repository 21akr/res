import { db } from '../../App';
import { FieldPacket, RowDataPacket } from 'mysql2';

export class TokenService {
  static async getByUserIdAndRefreshTokens(_userId: string, _refreshToken: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT * FROM tokens WHERE user_id = ? AND refresh_token = ?', [_userId, _refreshToken]);
  }
}

export class UserService {
  static async getUserIdById(_userId: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [_userId]);
  }

  static async updateStatusById(newStatus: string, _userId: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('UPDATE users SET status = ? WHERE id = ?', [newStatus, _userId]);
  }

}

export class FileService {
  static async getById(_id: number): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT * FROM files WHERE id = ?', [_id]);
  }

  static async getNameAndExtensionById(_id: number): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT name, extension FROM files WHERE id = ?', [_id])
  }
}
