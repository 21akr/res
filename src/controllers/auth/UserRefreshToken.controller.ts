import { Request, Response } from 'express';
import { SessionTokenService, TokenService, UserService } from '../../services';
import { StatusEnum } from '../../definitions/enums';

export async function UserRefreshTokenController(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(400).send('Refresh token missing');
  }

  try {
    const active = StatusEnum.ACTIVE.toString();
    const decoded = new SessionTokenService(process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES).buildTokenService(refreshToken).verify();
    const userId = decoded.userId;

    const [session] = await TokenService.getIdByRefreshToken(refreshToken);
    const sessionId = session[0].id

    const accessToken = new SessionTokenService(process.env.JWT_SECRET, process.env.JWT_EXPIRES, {
      userId: userId,
      sessionId: sessionId,
    }).sign();

    await UserService.updateStatusById(active, userId);

    res.json({ accessToken });
  } catch (err: any) {
    console.error('Error refreshing token:', err.message);
    return res.status(401).send('Unauthorized');
  }
}
