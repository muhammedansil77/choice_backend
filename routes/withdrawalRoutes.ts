import { Router } from 'express';
import {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from '../controllers/withdrawalController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = Router();

// Electrician routes (requires authentication)
router.post('/request', protect, requestWithdrawal);
router.get('/my', protect, getMyWithdrawals);

// Store Admin routes (requires admin role)
router.get('/all', protect, admin, getAllWithdrawals);
router.put('/:id/approve', protect, admin, approveWithdrawal);
router.put('/:id/reject', protect, admin, rejectWithdrawal);

export default router;
