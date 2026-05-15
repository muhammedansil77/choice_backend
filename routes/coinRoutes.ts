import express from 'express';
import { 
    addCoins, 
    reclaimCoins, 
    getAllTransactions, 
    getMyWallet, 
    distributeCoins,
    mintCoins,
    getAdminStats
} from '../controllers/coinController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Admin Routes
router.get('/stats', protect, admin, getAdminStats);
router.post('/mint', protect, admin, mintCoins);
router.post('/add', protect, admin, addCoins);
router.post('/reclaim', protect, admin, reclaimCoins);
router.post('/distribute', protect, admin, distributeCoins);
router.get('/transactions', protect, admin, getAllTransactions);

// User Routes
router.get('/mywallet', protect, getMyWallet);

export default router;
