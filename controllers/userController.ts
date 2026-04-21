import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

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
        const { name, email, password, coinBalance } = req.body;

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
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid coin amount' });
            return;
        }
        
        const user = await User.findById(req.params.id);
        if (user) {
            user.coinBalance = (user.coinBalance || 0) + Number(amount);
            await user.save();
            res.json({ message: 'Coins added successfully', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
