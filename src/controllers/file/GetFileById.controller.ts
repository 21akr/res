import { Request, Response } from 'express';
import { FileService } from '../../services';

export async function GetFileByIdController(req: Request, res: Response) {
  const fileId = req.params.id;

  try {
    const [rows] = await FileService.getById(fileId);

    if(rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const file = rows[0];
    res.json(file);
  } catch (err: any) {
    console.error('Error getting file by id:', err.message);
    res.status(500).send('Internal server error');
  }
}
