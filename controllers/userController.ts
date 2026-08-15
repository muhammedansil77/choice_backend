import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

const formatUser = (u: any) => ({
  _id: u.id,
  id: u.id,
  name: u.name,
  email: u.email,
  phoneNumber: u.phoneNumber,
  coinBalance: u.coinBalance,
  role: u.role,
  status: u.status,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || '',
        coinBalance: 0,
        role: role === 'admin' ? 'admin' : 'user',
        status: 'active',
      },
    });

    res.status(201).json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, coinBalance, phoneNumber } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || '',
        coinBalance: coinBalance ? parseFloat(coinBalance) : 0,
        role: 'user',
        status: 'active',
      },
    });

    res.status(201).json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        coinBalance: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map(formatUser));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      await prisma.user.update({
        where: { id },
        data: { status: 'blocked' },
      });
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
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      await prisma.user.update({
        where: { id },
        data: { status: 'active' },
      });
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
    const id = req.params.id as string;
    const { amount, note } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      res.status(400).json({ message: 'Invalid coin amount' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let wallet = await prisma.adminWallet.findFirst();
    if (!wallet || wallet.remainingCoins < numAmount) {
      res.status(400).json({ message: 'Insufficient admin supply' });
      return;
    }

    const [updatedUser, updatedWallet] = await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { coinBalance: { increment: numAmount } },
      }),
      prisma.adminWallet.update({
        where: { id: wallet.id },
        data: {
          distributedCoins: { increment: numAmount },
          remainingCoins: { decrement: numAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          senderId: 'ADMIN',
          receiverId: user.id,
          amount: numAmount,
          transactionType: 'distribution',
          note: note || 'Coins added by Admin',
        },
      }),
    ]);

    res.json({
      message: 'Coins added successfully',
      user: formatUser(updatedUser),
      wallet: {
        _id: updatedWallet.id,
        id: updatedWallet.id,
        totalCoins: updatedWallet.totalCoins,
        distributedCoins: updatedWallet.distributedCoins,
        remainingCoins: updatedWallet.remainingCoins,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userCount = await prisma.user.count({ where: { role: 'user' } });
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const productCount = await prisma.product.count();
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const wallet = await prisma.adminWallet.findFirst();

    res.json({
      users: userCount,
      admins: adminCount,
      products: productCount,
      totalCoins: wallet?.totalCoins || 0,
      remainingCoins: wallet?.remainingCoins || 0,
      distributedCoins: wallet?.distributedCoins || 0,
      recentActivity: transactions.map((t) => ({
        _id: t.id,
        id: t.id,
        senderId: t.senderId,
        receiverId: t.receiverId,
        amount: t.amount,
        transactionType: t.transactionType,
        note: t.note,
        createdAt: t.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
