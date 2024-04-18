import express from 'express';
import { FileService } from '../../services';

export async function FileDownloadController(req: express.Request, res: express.Response) {
  const fileId: number = req.params.id;

  try {
    const [rows] = await FileService.getNameAndExtensionById(fileId);
    if(rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const fileName = rows[0]?.name + '.' + rows[0]?.extension;
    const filePath = `uploads/${fileName}`;

    res.download(filePath, fileName);
  } catch (err: any) {
    console.error('Error downloading file:', err.message);
    res.status(500).send('Internal server error');
  }
}
