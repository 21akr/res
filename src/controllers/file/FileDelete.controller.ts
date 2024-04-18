import { Request, Response } from 'express';
import { db } from '../../../App';
import fs from 'fs';
import { FileService } from '../../services';

export async function FileDeleteController(req: Request, res: Response) {
  const fileId = req.params.id;

  try {
    const [rows] = await FileService.getNameAndExtensionById(fileId);
    if(rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const fileName = rows[0]?.name + '.' + rows[0]?.extension;
    const filePath = `uploads/${fileName}`;

    await db.promise().query('DELETE FROM files WHERE id = ?', [fileId]);

    if(fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).send('File deleted successfully');
  } catch (err: any) {
    console.error('Error deleting file:', err.message);
    res.status(500).send('Internal server error');
  }
}
