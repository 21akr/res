import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../../App';
import { UserSignUpParams } from '../../definitions';
import { RowDataPacket } from 'mysql2';
import { UserAccessTokenStatusEnum } from '../../definitions/enums';

export async function UserSignInController(req: Request, res: Response) {
  let params: UserSignUpParams;

  try {
    params = await new UserSignUpParams(req.body).validate();
  } catch (err) {
    console.error(err);
    return res.status(400).send(`Invalid request parameters \n ${err}`);
  }

  try {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [params.id]);
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = rows[0];
    const userId = user.id;

    if (!(await bcrypt.compare(params.password, user.password))) {
      return res.status(401).send('Error: User is unauthorized');
    }

    const accessToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET);
    const new_status = UserAccessTokenStatusEnum.ACTIVE.toString();

    await db.promise().query('UPDATE users SET status = ? WHERE id = ?', [new_status, userId]);
    await db.promise().query('INSERT INTO tokens (user_id, refresh_token) VALUES (?, ?)', [userId, refreshToken]);

    res.json({ accessToken, refreshToken, status: new_status });
  } catch (err: any) {
    console.error('Error signing in:', err.message);
    return res.status(500).send('Internal server error');
  }
}
