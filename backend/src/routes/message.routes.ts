import { Router } from 'express';
import multer from 'multer';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // Get file extension
    const ext = file.originalname.split('.').pop() || 'jpg';
    
    // Create safe filename (no special characters, no Arabic/Unicode)
    const safeFilename = `image-${uniqueSuffix}.${ext}`;
    
    cb(null, safeFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
});

router.use(authenticate);

router.get('/:customerId', MessageController.getMessages);
router.post('/send', MessageController.sendMessage);
router.post('/upload', upload.single('image'), MessageController.uploadImage);

export default router;
