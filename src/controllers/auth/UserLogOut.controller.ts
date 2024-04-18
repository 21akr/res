import { Request, Response } from 'express';
import { db } from '../../../App';
import { UserAccessTokenStatusEnum } from '../../definitions/enums';
import { UserService } from '../../services';

export async function UserLogOutController(req: Request, res: Response) {
  const userId = req.user.id;
  const newStatus = UserAccessTokenStatusEnum.INACTIVE.toString();

  try {
    const result = await db.promise().query('DELETE FROM tokens WHERE user_id = ?', [userId]);
    await UserService.updateStatusById(newStatus, userId)
    const resultSetHeader = result[0] as any;

    if (resultSetHeader.affectedRows > 0) {
      console.log(`Deleted ${resultSetHeader.affectedRows} token/s for user ${userId}`);

      return res.status(200).send('Logged out successfully');
    } else {
      console.log(`No tokens found for user ${userId}`);

      return res.status(400).send('No tokens found for user');
    }
  } catch (err: any) {
    console.error('Error logging out:', err.message);

    return res.status(500).send('Internal server error');
  }
}
