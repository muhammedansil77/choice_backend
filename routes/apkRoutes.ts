import { Router } from 'express';
import {
  getLatestApkInfo,
  downloadLatestApkFile,
  uploadNewApk,
  getAllApkReleases,
  deleteApkRelease,
} from '../controllers/apkController';
import { uploadApk } from '../middlewares/apkUploadMiddleware';
import { protect, admin } from '../middlewares/authMiddleware';

const router = Router();

// Public Endpoints
router.get('/latest', getLatestApkInfo);
router.get('/download/latest', downloadLatestApkFile);

// Protected Admin Endpoints
router.get('/releases', protect, admin, getAllApkReleases);
router.post('/upload', protect, admin, uploadApk.single('apk'), uploadNewApk);
router.delete('/:id', protect, admin, deleteApkRelease);

export default router;
