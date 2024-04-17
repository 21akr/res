import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import { db } from '../../../App';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_, file, cb) => {
    const fileName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    cb(null, fileName + ext);
  },
});
const upload = multer({ storage });

export async function FileUpdateController(req: Request, res: Response) {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Internal server error');
    }

    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    const { originalname, mimetype, size } = file;
    const newFileName = path.parse(originalname).name;
    const newBaseFileName = path.parse(originalname).base;
    const newExtension = path.extname(originalname).replace('.', '');
    const fileId = req.params.id;

    try {
      const [rows] = await db.promise().query('SELECT name, extension FROM files WHERE id = ?', fileId);
      const oldFileName = rows[0]?.name + '.' + rows[0]?.extension;
      const filePath = `uploads/${oldFileName}`;

      if (oldFileName === newBaseFileName) {
        console.log(`File ${originalname} uploaded successfully`);
        return res.status(201).send('File uploaded successfully');
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await db
        .promise()
        .query('UPDATE files SET name = ?, extension = ?, mime_type = ?, size = ?, date_uploaded = NOW() WHERE id = ?', [
          newFileName,
          newExtension,
          mimetype,
          size,
          fileId,
        ]);

      console.log(`File ${originalname} updated successfully`);
      res.status(201).send('File updated successfully');
    } catch (err: any) {
      console.error('Error updating file:', err.message);
      res.status(500).send('Internal server error');
    }
  });
}
