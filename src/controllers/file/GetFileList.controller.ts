import { Request, Response } from 'express';
import { db } from '../../../App';
import { RowDataPacket } from 'mysql2';

export async function GetFileListController(req: Request, res: Response) {
  const pageSize = parseInt(req.query.list_size as string, 10) || 10;
  const page = parseInt(req.query.page_size as string, 10) || 1;
  let totalPages: number;

  try {
    const [countRows] = await db.promise().query('SELECT COUNT(*) as count FROM files');
    const totalRecords = countRows[0].count;

    if (totalRecords) {
      totalPages = Math.ceil(totalRecords / pageSize);
    }

    if (page < 1 || page > totalPages) {
      console.log(page < 1);
      return res.status(400).send('Invalid page number');
    }

    const offset = (page - 1) * pageSize;

    const [rows] = await db
      .promise()
      .query<RowDataPacket[]>('SELECT id, name, extension, mime_type, size, date_uploaded FROM files LIMIT ?, ?', [offset, pageSize]);

    const files = rows.map((row: RowDataPacket) => ({
      id: row.id,
      name: row.name,
      extension: row.extension,
      mime_type: row.mime_type,
      size: row.size,
      date_uploaded: row.date_uploaded,
    }));

    res.json({ pages: totalPages, count: totalRecords, files });
  } catch (err: any) {
    console.error('Error fetching files:', err.message);
    res.status(500).send('Internal server error');
  }
}
