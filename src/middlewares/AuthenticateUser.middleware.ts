import express from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { db } from '../../App';
import { StatusEnum } from '../definitions/enums';
import { SessionTokenService, TokenService, UserService } from '../services';

export interface DecodedToken {
  userId: string;
  sessionId: string;
}

export async function AuthenticateUserMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const accessToken = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.body.refreshToken;
  if (!accessToken && !refreshToken) {
    return res.status(400).send('Access token or refresh token missing');
  }

  try {
    let userId: string;
    let decoded: DecodedToken;

    const active = StatusEnum.ACTIVE.toString();

    if (accessToken) {
      decoded = new SessionTokenService(process.env.JWT_SECRET, process.env.JWT_EXPIRES).buildTokenService(accessToken).verify();
      userId = decoded.userId;

      const [statusRow] = await db
        .promise()
        .query('SELECT u.status AS user_status, t.status AS token_status FROM users u LEFT JOIN tokens t ON u.id = t.user_id WHERE u.id = ?', [
          userId,
        ]);

      const status = statusRow[0];

      if (!accessToken || (status?.user_status || status?.token_status) !== active) {
        return res.status(401).send('Token expired');
      }
    } else if (refreshToken) {
      decoded = new SessionTokenService(process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES).buildTokenService(refreshToken).verify();
      userId = decoded.userId;

      const [tokenRows] = await TokenService.getByRefreshToken(refreshToken);
      if (tokenRows?.length === 0) {
        return res.status(401).send('Refresh token not found');
      }
    }

    const [rows] = await UserService.getUserIdById(userId);
    if (rows.length === 0) {
      return res.status(404).send('User not found');
    }

    req.user = { id: userId };
    next();
  } catch (err: any) {
    if (err instanceof TokenExpiredError) {
      console.error('Token expired:', err.message);
      return res.status(401).send('Token expired');
    } else {
      console.error('Error verifying tokens:', err.message);
      return res.status(401).send('Unauthorized');
    }
  }
}
