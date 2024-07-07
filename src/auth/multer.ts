import multer, { Multer } from 'multer';
import { RequestHandler } from 'express';

const storage = multer.memoryStorage();
const upload: Multer = multer({ storage });

const multipleUpload = upload.array('file', 5); // Limiting to 5 files

export default multipleUpload;