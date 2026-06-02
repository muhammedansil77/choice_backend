import multer from 'multer';

// Use memory storage to store files in memory as Buffers.
// This allows us to upload to Cloudinary in the controller and fall back to Base64 if Cloudinary fails.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;
