import express from 'express';
import path from 'path';
import { db } from '../../../App';
import { RowDataPacket } from 'mysql2';

export async function FileDownloadController(req: express.Request, res: express.Response) {
  const fileId = req.params.id;

  try {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM files WHERE id = ?', [fileId]);
    if (rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const file = rows[0];
    const filePath = path.join(__dirname, `../../../uploads/${file.id}.${file.extension}`);

    res.download(filePath, file.name);
  } catch (err: any) {
    console.error('Error downloading file:', err.message);
    res.status(500).send('Internal server error');
  }
}
