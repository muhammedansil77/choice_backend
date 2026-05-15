import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Transaction from '../models/Transaction';
import AdminWallet from '../models/AdminWallet';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            coinBalance: 0,
            role: role === 'admin' ? 'admin' : 'user',
            status: 'active',
        });

        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, coinBalance, phoneNumber } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            coinBalance: coinBalance || 0,
            role: 'user',
            status: 'active',
        });

        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.status = 'blocked';
            await user.save();
            res.json({ message: 'User blocked' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const unblockUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.status = 'active';
            await user.save();
            res.json({ message: 'User unblocked' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, note } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid coin amount' });
            return;
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const wallet = await AdminWallet.findOne();
        if (!wallet || wallet.remainingCoins < amount) {
            res.status(400).json({ message: 'Insufficient admin supply' });
            return;
        }

        user.coinBalance = (user.coinBalance || 0) + Number(amount);
        await user.save();

        wallet.distributedCoins += Number(amount);
        wallet.remainingCoins = wallet.totalCoins - wallet.distributedCoins;
        await wallet.save();

        // Create transaction for history
        await Transaction.create({
            senderId: 'ADMIN',
            receiverId: user._id,
            amount: Number(amount),
            transactionType: 'distribution',
            note: note || 'Coins added by Admin'
        });

        res.json({ message: 'Coins added successfully', user, wallet });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const userCount = await User.countDocuments({ role: 'user' });
        const adminCount = await User.countDocuments({ role: 'admin' });
        
        const Product = (await import('../models/Product')).default;
        
        const productCount = await Product.countDocuments();
        const transactions = await Transaction.find().sort('-createdAt').limit(5);
        
        const wallet = await AdminWallet.findOne();

        res.json({
            users: userCount,
            admins: adminCount,
            products: productCount,
            totalCoins: wallet?.totalCoins || 0,
            remainingCoins: wallet?.remainingCoins || 0,
            distributedCoins: wallet?.distributedCoins || 0,
            recentActivity: transactions
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
