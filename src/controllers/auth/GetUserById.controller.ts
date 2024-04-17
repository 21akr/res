import { Request, Response } from 'express';
import { db } from '../../../App';
import { RowDataPacket } from 'mysql2';

export async function GetUserByIdController(req: Request, res: Response) {
  const userId = req.user.id;

  try {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = rows[0];
    res.json(user);
  } catch (err: any) {
    console.error('Error getting user:', err.message);
    return res.status(500).send('Internal server error');
  }
}
