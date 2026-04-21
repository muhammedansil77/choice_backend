import express from 'express';
import { createUser, getUsers, blockUser, unblockUser, registerUser, addCoins } from '../controllers/userController';
import { protect, admin } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/register').post(registerUser);

router.route('/')
    .post(protect, admin, createUser)
    .get(protect, admin, getUsers);

router.route('/:id/block').put(protect, admin, blockUser);
router.route('/:id/unblock').put(protect, admin, unblockUser);
router.route('/:id/coins').put(protect, admin, addCoins);

export default router;
