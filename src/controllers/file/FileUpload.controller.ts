import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
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

export async function FileUploadController(req: Request, res: Response) {
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
    const fileName = path.parse(originalname).name;
    const baseFileName = path.parse(originalname).base

    try {
      const extension = originalname.split('.').pop() || '';

      const [checkFile] = await db.promise().query('SELECT name, extension FROM files WHERE name = ?', fileName);
      const oldFileName = checkFile[0]?.name + '.' + checkFile[0]?.extension;

      if (oldFileName === baseFileName) {
        console.log(`File ${originalname} uploaded successfully`);
        return res.status(201).send('File uploaded successfully');
      }

      await db
        .promise()
        .query('INSERT INTO files (name, extension, mime_type, size, date_uploaded) VALUES (?, ?, ?, ?, NOW())', [
          fileName,
          extension,
          mimetype,
          size,
        ]);

      console.log(`File ${originalname} uploaded successfully`);
      res.status(201).send('File uploaded successfully');
    } catch (err: any) {
      console.error('Error uploading file:', err.message);
      res.status(500).send('Internal server error');
    }
  });
}
