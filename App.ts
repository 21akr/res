import express from 'express';
import mysql from 'mysql2';
import * as dotenv from 'dotenv';
import { AuthRoutes, FileRoutes } from './routes';
import * as bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use(AuthRoutes);
app.use(FileRoutes);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
