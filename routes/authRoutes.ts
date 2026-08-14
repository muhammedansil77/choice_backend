import express from 'express';
import { loginUser, sendRegisterOtp, registerWithOtp } from '../controllers/authController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/send-otp', sendRegisterOtp);
router.post('/register', registerWithOtp);

export default router;
