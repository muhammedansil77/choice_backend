import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { sendOtpEmail } from '../services/emailService';
import { sendPhoneOtp as sendSmsOtp } from '../services/smsService';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password || ''))) {
            if (user.status === 'blocked') {
                res.status(401).json({ message: 'User is blocked' });
                return;
            }
            res.json({
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                coinBalance: user.coinBalance,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const sendRegisterOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // Generate 6-digit OTP code
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this email
        await prisma.otp.deleteMany({ where: { email } });

        // Save new OTP with 10-minute expiry
        await prisma.otp.create({
            data: {
                email,
                otp: generatedOtp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        // Send OTP email via Nodemailer
        const emailSent = await sendOtpEmail(email, generatedOtp);

        if (!emailSent) {
            console.warn(`[DEV FALLBACK] Nodemailer email failed or credentials unconfigured. Generated OTP for ${email}: ${generatedOtp}`);
        }

        res.status(200).json({
            message: 'OTP sent to your email successfully',
            email,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const registerWithOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phoneNumber, otp } = req.body;

        if (!name || !email || !password || !otp) {
            res.status(400).json({ message: 'Name, email, password, and OTP are required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Verify OTP
        const otpRecord = await prisma.otp.findFirst({
            where: {
                email,
                otp,
                expiresAt: { gte: new Date() },
            },
        });

        if (!otpRecord) {
            res.status(400).json({ message: 'Invalid or expired OTP code' });
            return;
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber: phoneNumber || '',
                coinBalance: 0,
                role: 'user',
                status: 'active',
            },
        });

        // Delete used OTP
        await prisma.otp.deleteMany({ where: { email } });

        res.status(201).json({
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            coinBalance: user.coinBalance,
            token: generateToken(user.id, user.role),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Send Mobile Phone OTP via Fast2SMS
export const sendPhoneOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber, name } = req.body;

        if (!phoneNumber) {
            res.status(400).json({ message: 'Phone number is required' });
            return;
        }

        let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.slice(2);
        }
        if (cleanPhone.length !== 10) {
            res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
            return;
        }

        // Generate 6-digit OTP code
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing OTPs for this phone number
        await prisma.otp.deleteMany({
            where: {
                phoneNumber: cleanPhone,
            },
        });

        // Save new OTP with 10-minute expiry
        await prisma.otp.create({
            data: {
                phoneNumber: cleanPhone,
                name: name ? name.trim() : undefined,
                otp: generatedOtp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        // Send OTP via Fast2SMS
        const smsResult = await sendSmsOtp(cleanPhone, generatedOtp);

        res.status(200).json({
            message: smsResult.message || 'OTP sent successfully to your mobile number',
            phoneNumber: cleanPhone,
            success: true,
            ...(smsResult.fallbackOtp ? { devOtp: smsResult.fallbackOtp } : {}),
        });
    } catch (error: any) {
        console.error('Error in sendPhoneOtp:', error);
        res.status(500).json({ message: error.message });
    }
};

// 5. Verify Mobile Phone OTP & Automatic Login/Registration
export const verifyPhoneOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phoneNumber, otp, name } = req.body;

        if (!phoneNumber || !otp) {
            res.status(400).json({ message: 'Phone number and verification OTP are required' });
            return;
        }

        let cleanPhone = phoneNumber.toString().replace(/\D/g, '');
        if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
            cleanPhone = cleanPhone.slice(2);
        }

        const cleanOtp = otp.toString().trim();

        // Verify OTP against database
        const otpRecord = await prisma.otp.findFirst({
            where: {
                phoneNumber: cleanPhone,
                otp: cleanOtp,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otpRecord) {
            res.status(400).json({ message: 'Invalid or expired verification code' });
            return;
        }

        // Check if user already exists with this phone number or placeholder email
        const fallbackEmail = `${cleanPhone}@choicepos.com`;
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phoneNumber: cleanPhone },
                    { email: fallbackEmail },
                ],
            },
        });

        const effectiveName = (name && name.trim().length > 0)
            ? name.trim()
            : (otpRecord.name && otpRecord.name.trim().length > 0)
                ? otpRecord.name.trim()
                : (user?.name || `Customer ${cleanPhone.slice(-4)}`);

        if (user) {
            if (user.status === 'blocked') {
                res.status(401).json({ message: 'Account is blocked. Please contact support.' });
                return;
            }
            // Update name and ensure phoneNumber is recorded
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: (user.name && user.name !== 'Guest User' && !user.name.startsWith('Customer ')) ? user.name : effectiveName,
                    phoneNumber: cleanPhone,
                },
            });
        } else {
            // Instant seamless registration! No separate registration page needed
            const randomPassword = await bcrypt.hash(`Choice_${cleanPhone}_${Date.now()}`, 10);
            user = await prisma.user.create({
                data: {
                    name: effectiveName,
                    phoneNumber: cleanPhone,
                    email: fallbackEmail,
                    password: randomPassword,
                    coinBalance: 0,
                    role: 'user',
                    status: 'active',
                },
            });
        }

        // Delete used OTP
        await prisma.otp.deleteMany({ where: { phoneNumber: cleanPhone } });

        res.status(200).json({
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            coinBalance: user.coinBalance,
            token: generateToken(user.id, user.role),
            isNewUser: !user.createdAt || (Date.now() - new Date(user.createdAt).getTime() < 10000),
        });
    } catch (error: any) {
        console.error('Error in verifyPhoneOtp:', error);
        res.status(500).json({ message: error.message });
    }
};

