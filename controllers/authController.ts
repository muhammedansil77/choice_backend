import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { sendOtpEmail } from '../services/emailService';

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
