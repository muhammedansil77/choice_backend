import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middlewares/authMiddleware';

export const addCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);

        if (user) {
            user.coinBalance += amount;
            await user.save();

            await Transaction.create({
                user: userId,
                amount,
                type: 'added',
                description: `Added ${amount} coins by admin`,
            });

            res.json({ message: 'Coins added successfully', coinBalance: user.coinBalance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deductCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);

        if (user) {
            if (user.coinBalance < amount) {
                res.status(400).json({ message: 'Insufficient coin balance to deduct' });
                return;
            }
            user.coinBalance -= amount;
            await user.save();

            await Transaction.create({
                user: userId,
                amount,
                type: 'deducted',
                description: `Deducted ${amount} coins by admin`,
            });

            res.json({ message: 'Coins deducted successfully', coinBalance: user.coinBalance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const transactions = await Transaction.find().populate('user', 'name email').sort('-createdAt');
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const transactions = await Transaction.find({ user: req.user._id }).sort('-createdAt');
        res.json({
            coinBalance: req.user.coinBalance,
            transactions,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
