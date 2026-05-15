import { Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import AdminWallet from '../models/AdminWallet';

// 1. Get Admin Wallet Stats
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
    try {
        let wallet = await AdminWallet.findOne();
        if (!wallet) {
            wallet = await AdminWallet.create({ totalCoins: 0, distributedCoins: 0, remainingCoins: 0 });
        }
        res.json(wallet);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Admin Mints Coins (Create new supply)
export const mintCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, note } = req.body;
        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }

        let wallet = await AdminWallet.findOne();
        if (!wallet) {
            wallet = new AdminWallet();
        }

        wallet.totalCoins += amount;
        wallet.remainingCoins = wallet.totalCoins - wallet.distributedCoins;
        await wallet.save();

        await Transaction.create({
            senderId: 'SYSTEM',
            receiverId: 'ADMIN',
            amount,
            transactionType: 'mint',
            note: note || `Minted ${amount} coins into central supply`
        });

        res.json({ message: 'Coins minted successfully', wallet });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Admin Distributes Coins to specific user
export const addCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, amount, note } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const wallet = await AdminWallet.findOne();
        if (!wallet || wallet.remainingCoins < amount) {
            res.status(400).json({ message: 'Insufficient admin supply to distribute coins' });
            return;
        }

        // Transactional update
        user.coinBalance += amount;
        await user.save();

        wallet.distributedCoins += amount;
        wallet.remainingCoins = wallet.totalCoins - wallet.distributedCoins;
        await wallet.save();

        await Transaction.create({
            senderId: 'ADMIN',
            receiverId: userId,
            amount,
            transactionType: 'distribution',
            note: note || `Distributed ${amount} coins to ${user.name}`
        });

        res.json({ message: 'Coins distributed successfully', userBalance: user.coinBalance, wallet });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Admin Distributes Coins to ALL users (Bulk)
export const distributeCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, note } = req.body;
        const userCount = await User.countDocuments({ role: 'user' });
        const totalNeeded = amount * userCount;

        const wallet = await AdminWallet.findOne();
        if (!wallet || wallet.remainingCoins < totalNeeded) {
            res.status(400).json({ 
                message: `Insufficient supply. Need ${totalNeeded} but only ${wallet?.remainingCoins || 0} available.` 
            });
            return;
        }

        // Update all users
        await User.updateMany({ role: 'user' }, { $inc: { coinBalance: amount } });

        // Update admin wallet
        wallet.distributedCoins += totalNeeded;
        wallet.remainingCoins = wallet.totalCoins - wallet.distributedCoins;
        await wallet.save();

        // Log transaction for each user
        const users = await User.find({ role: 'user' }, '_id');
        const logs = users.map(u => ({
            senderId: 'ADMIN',
            receiverId: u._id,
            amount,
            transactionType: 'distribution',
            note: note || `Bulk distribution of ${amount} coins`
        }));
        await Transaction.insertMany(logs);

        res.json({ message: 'Bulk distribution successful', distributedTotal: totalNeeded, wallet });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Admin Reclaims Coins from user
export const reclaimCoins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, amount, note } = req.body;
        const user = await User.findById(userId);

        if (!user || user.coinBalance < amount) {
            res.status(400).json({ message: 'Insufficient user balance' });
            return;
        }

        user.coinBalance -= amount;
        await user.save();

        const wallet = await AdminWallet.findOne();
        if (wallet) {
            wallet.distributedCoins -= amount;
            wallet.remainingCoins = wallet.totalCoins - wallet.distributedCoins;
            await wallet.save();
        }

        await Transaction.create({
            senderId: userId,
            receiverId: 'ADMIN',
            amount,
            transactionType: 'reclaim',
            note: note || `Reclaimed ${amount} coins from ${user.name}`
        });

        res.json({ message: 'Coins reclaimed successfully', userBalance: user.coinBalance, wallet });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Get All Transactions
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const transactions = await Transaction.find().sort('-createdAt');
        res.json(transactions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Get User Wallet
export const getMyWallet = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);
        const transactions = await Transaction.find({ 
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] 
        }).sort('-createdAt');
        
        res.json({
            coinBalance: user?.coinBalance || 0,
            transactions
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
