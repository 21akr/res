import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../../App';
import { RowDataPacket } from 'mysql2';

export async function UserRefreshTokenController(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).send('Refresh token missing');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const [tokenRows] = await db
      .promise()
      .query<RowDataPacket[]>('SELECT * FROM tokens WHERE user_id = ? AND refresh_token = ?', [userId, refreshToken]);
    if (tokenRows.length === 0) {
      return res.status(401).send('Refresh token not found');
    }

    const accessToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '10m' });

    res.json({ accessToken });
  } catch (err: any) {
    console.error('Error refreshing token:', err.message);
    return res.status(401).send('Unauthorized');
  }
}
