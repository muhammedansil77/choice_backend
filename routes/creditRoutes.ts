import express from 'express';
import {
  createCreditEntry,
  getCreditEntriesByAdmin,
  getUserCreditSummaryByAdmin,
  getMyCreditLedger,
  updateCreditEntry,
  deleteCreditEntry,
} from '../controllers/creditController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

// Flutter Mobile App User: View own credit ledger
router.get('/my-ledger', protect, getMyCreditLedger);

// Admin: View specific user credit summary
router.get('/user/:userId', protect, admin, getUserCreditSummaryByAdmin);

// Admin: CRUD operations for credit entries
router.get('/', protect, admin, getCreditEntriesByAdmin);
router.post('/', protect, admin, createCreditEntry);
router.put('/:id', protect, admin, updateCreditEntry);
router.delete('/:id', protect, admin, deleteCreditEntry);

export default router;
