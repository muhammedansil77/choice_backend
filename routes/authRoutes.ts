import express from 'express';
import { 
    loginUser, 
    sendRegisterOtp, 
    registerWithOtp,
    sendPhoneOtp,
    verifyPhoneOtp
} from '../controllers/authController';

const router = express.Router();

// Phone OTP Authentication (Fast2SMS)
router.post('/send-phone-otp', sendPhoneOtp);
router.post('/verify-phone-otp', verifyPhoneOtp);

// Legacy / Admin routes
router.post('/login', loginUser);
router.post('/send-otp', sendRegisterOtp);
router.post('/register', registerWithOtp);

export default router;
