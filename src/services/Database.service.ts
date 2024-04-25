import { db } from '../../App';
import { FieldPacket, RowDataPacket } from 'mysql2';

export class TokenService {
  static async getByRefreshToken(_refreshToken: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT * FROM tokens WHERE refresh_token = ?', [_refreshToken]);
  }

  static async getIdByRefreshToken(_refreshToken: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT id FROM tokens WHERE refresh_token = ?', [_refreshToken]);
  }

  static async getIdByUserId(_userId: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT id FROM tokens WHERE user_id = ?', [_userId]);
  }

  static async updateStatusById(newStatus: string, _id: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('UPDATE tokens SET status = ? WHERE id = ?', [newStatus, _id]);
  }
}

export class UserService {
  static async getUserIdById(_userId: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [_userId]);
  }

  static async getStatusById(_userId: string): Promise<[RowDataPacket[], FieldPacket[]]> {
    return db.promise().query<RowDataPacket[]>('SELECT status FROM users WHERE id = ?', [_userId]);
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
    return db.promise().query<RowDataPacket[]>('SELECT name, extension FROM files WHERE id = ?', [_id]);
  }
}
