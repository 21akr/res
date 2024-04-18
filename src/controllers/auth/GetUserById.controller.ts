import { Request, Response } from 'express';
import { UserService } from '../../services';

export async function GetUserByIdController(req: Request, res: Response) {
  const userId = req.user.id;

  try {
    const [rows] = await UserService.getUserIdById(userId);
    if(rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = rows[0];
    res.json(user);
  } catch (err: any) {
    console.error('Error getting user:', err.message);
    return res.status(500).send('Internal server error');
  }
}
