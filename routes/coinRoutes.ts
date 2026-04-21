import express from 'express';
import { addCoins, deductCoins, getAllTransactions, getMyWallet } from '../controllers/coinController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/add', protect, admin, addCoins);
router.post('/deduct', protect, admin, deductCoins);
router.get('/transactions', protect, admin, getAllTransactions);
router.get('/mywallet', protect, getMyWallet);

export default router;
