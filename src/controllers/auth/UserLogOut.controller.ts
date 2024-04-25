import { Request, Response } from 'express';
import { db } from '../../../App';
import { StatusEnum } from '../../definitions/enums';
import { UserService } from '../../services';

export async function UserLogOutController(req: Request, res: Response) {
  const userId = req.user.id;

  try {
    const inactive = StatusEnum.INACTIVE.toString();

    await db.promise().query('UPDATE tokens SET status = ? WHERE user_id = ?', [inactive, userId]);

    await UserService.updateStatusById(inactive, userId);

    return res.status(200).send('Logged out successfully');
  } catch (err: any) {
    console.error('Error logging out:', err.message);
    return res.status(500).send('Internal server error');
  }
}
