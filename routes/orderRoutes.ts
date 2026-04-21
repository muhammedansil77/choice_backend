import express from 'express';
import { buyProduct, getMyOrders, getAllOrders, getPendingOrders, approveOrder, rejectOrder } from '../controllers/orderController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/buy', protect, buyProduct);
router.get('/myorders', protect, getMyOrders);
router.get('/all', protect, admin, getAllOrders);
router.get('/pending', protect, admin, getPendingOrders);
router.put('/:id/approve', protect, admin, approveOrder);
router.put('/:id/reject', protect, admin, rejectOrder);

export default router;
