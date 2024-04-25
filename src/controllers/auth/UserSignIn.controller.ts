import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../../../App';
import { UserSignUpParams } from '../../definitions';
import { RowDataPacket } from 'mysql2';
import { SessionTokenService, UserService } from '../../services';
import { v4 as uuid } from 'uuid';
import { StatusEnum } from '../../definitions/enums';

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

    const refreshTokenExpires = process.env.JWT_REFRESH_EXPIRES;
    const user = rows[0];
    const userId = user.id;

    const sessionId = uuid();

    if (!(await bcrypt.compare(params.password, user.password))) {
      return res.status(401).send('Error: User is unauthorized');
    }

    const accessToken = new SessionTokenService(process.env.JWT_SECRET, process.env.JWT_EXPIRES, {
      userId: userId,
      sessionId: sessionId,
    }).sign();

    const refreshToken = new SessionTokenService(process.env.JWT_REFRESH_SECRET, refreshTokenExpires, {
      userId: userId,
    }).sign();

    const newStatus = StatusEnum.ACTIVE.toString();

    await UserService.updateStatusById(newStatus, userId);

    await db
      .promise()
      .query('INSERT INTO tokens (id, user_id, access_token, refresh_token, status, expires) VALUES (?, ?, ?, ?, ?, ?)', [
        sessionId,
        userId,
        accessToken,
        refreshToken,
        newStatus,
        refreshTokenExpires,
      ]);

    res.json({ accessToken, refreshToken });
  } catch (err: any) {
    console.error('Error signing in:', err.message);
    return res.status(500).send('Internal server error');
  }
}
