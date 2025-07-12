import multer from 'multer';
import path from 'path';

// Configure storage
const tempDir = path.join(process.cwd(), 'temp');

const multerConfig = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Create middleware
const upload = multer({
  storage: multerConfig
});

export default upload;
