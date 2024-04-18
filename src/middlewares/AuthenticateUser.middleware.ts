import express from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { db } from '../../App';
import { UserAccessTokenStatusEnum } from '../definitions/enums';
import { TokenService, UserService } from '../services';

interface DecodedToken {
  userId: string;
}

export async function AuthenticateUserMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const accessToken = req.headers.authorization?.split(' ')[1];
  const refreshToken = req.body.refreshToken;

  if(!accessToken && !refreshToken) {
    return res.status(400).send('Access token or refresh token missing');
  }

  try {
    let userId: string;
    const status_active = UserAccessTokenStatusEnum.ACTIVE.toString();

    if(accessToken) {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {ignoreExpiration: false}) as DecodedToken;
      userId = decoded.userId;

      const status = await db.promise().query('SELECT status FROM users WHERE id = ?', [userId]);
      if(!accessToken || status[0][0].status !== status_active) {
        return res.status(401).send('Token expired');
      }
    } else if(refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET) as DecodedToken;
      userId = decoded.userId;

      const [tokenRows] = await TokenService.getByUserIdAndRefreshTokens(userId, refreshToken);
      if(tokenRows.length === 0) {
        return res.status(401).send('Refresh token not found');
      }
    }

    const [rows] = await UserService.getUserIdById(userId);
    if(rows.length === 0) {
      return res.status(404).send('User not found');
    }

    req.user = {id: userId};
    next();
  } catch (err: any) {
    if(err instanceof TokenExpiredError) {
      console.error('Token expired:', err.message);
      return res.status(401).send('Token expired');
    } else {
      console.error('Error verifying tokens:', err.message);
      return res.status(401).send('Unauthorized');
    }
  }
}
