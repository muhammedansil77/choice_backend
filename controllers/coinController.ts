import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const formatTransaction = (t: any) => ({
  _id: t.id,
  id: t.id,
  senderId: t.senderId,
  receiverId: t.receiverId,
  amount: t.amount,
  transactionType: t.transactionType,
  note: t.note,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

const formatWallet = (w: any) => ({
  _id: w.id,
  id: w.id,
  totalCoins: w.totalCoins,
  distributedCoins: w.distributedCoins,
  remainingCoins: w.remainingCoins,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});

// 1. Get Admin Wallet Stats
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    let wallet = await prisma.adminWallet.findFirst();
    if (!wallet) {
      wallet = await prisma.adminWallet.create({
        data: { totalCoins: 0, distributedCoins: 0, remainingCoins: 0 },
      });
    }
    res.json(formatWallet(wallet));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Admin Mints Coins (Create new supply)
export const mintCoins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, note } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    let wallet = await prisma.adminWallet.findFirst();
    if (!wallet) {
      wallet = await prisma.adminWallet.create({
        data: { totalCoins: 0, distributedCoins: 0, remainingCoins: 0 },
      });
    }

    const newTotal = wallet.totalCoins + numAmount;
    const newRemaining = newTotal - wallet.distributedCoins;

    const [updatedWallet] = await prisma.$transaction([
      prisma.adminWallet.update({
        where: { id: wallet.id },
        data: {
          totalCoins: newTotal,
          remainingCoins: newRemaining,
        },
      }),
      prisma.transaction.create({
        data: {
          senderId: 'SYSTEM',
          receiverId: 'ADMIN',
          amount: numAmount,
          transactionType: 'mint',
          note: note || `Minted ${numAmount} coins into central supply`,
        },
      }),
    ]);

    res.json({ message: 'Coins minted successfully', wallet: formatWallet(updatedWallet) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Admin Distributes Coins to specific user
export const addCoins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount, note } = req.body;
    const numAmount = parseFloat(amount);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let wallet = await prisma.adminWallet.findFirst();
    if (!wallet || wallet.remainingCoins < numAmount) {
      res.status(400).json({ message: 'Insufficient admin supply to distribute coins' });
      return;
    }

    const [updatedUser, updatedWallet] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
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
          receiverId: userId,
          amount: numAmount,
          transactionType: 'distribution',
          note: note || `Distributed ${numAmount} coins to ${user.name}`,
        },
      }),
    ]);

    res.json({
      message: 'Coins distributed successfully',
      userBalance: updatedUser.coinBalance,
      wallet: formatWallet(updatedWallet),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Admin Distributes Coins to ALL users (Bulk)
export const distributeCoins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, note } = req.body;
    const numAmount = parseFloat(amount);
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true },
    });

    const userCount = users.length;
    const totalNeeded = numAmount * userCount;

    let wallet = await prisma.adminWallet.findFirst();
    if (!wallet || wallet.remainingCoins < totalNeeded) {
      res.status(400).json({
        message: `Insufficient supply. Need ${totalNeeded} but only ${wallet?.remainingCoins || 0} available.`,
      });
      return;
    }

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { role: 'user' },
        data: { coinBalance: { increment: numAmount } },
      }),
      prisma.adminWallet.update({
        where: { id: wallet.id },
        data: {
          distributedCoins: { increment: totalNeeded },
          remainingCoins: { decrement: totalNeeded },
        },
      }),
      prisma.transaction.createMany({
        data: users.map((u) => ({
          senderId: 'ADMIN',
          receiverId: u.id,
          amount: numAmount,
          transactionType: 'distribution',
          note: note || `Bulk distribution of ${numAmount} coins`,
        })),
      }),
    ]);

    const refreshedWallet = await prisma.adminWallet.findFirst();

    res.json({
      message: 'Bulk distribution successful',
      distributedTotal: totalNeeded,
      wallet: formatWallet(refreshedWallet),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Admin Reclaims Coins from user
export const reclaimCoins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount, note } = req.body;
    const numAmount = parseFloat(amount);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.coinBalance < numAmount) {
      res.status(400).json({ message: 'Insufficient user balance' });
      return;
    }

    let wallet = await prisma.adminWallet.findFirst();

    const [updatedUser, updatedWallet] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coinBalance: { decrement: numAmount } },
      }),
      ...(wallet
        ? [
            prisma.adminWallet.update({
              where: { id: wallet.id },
              data: {
                distributedCoins: { decrement: numAmount },
                remainingCoins: { increment: numAmount },
              },
            }),
          ]
        : []),
      prisma.transaction.create({
        data: {
          senderId: userId,
          receiverId: 'ADMIN',
          amount: numAmount,
          transactionType: 'reclaim',
          note: note || `Reclaimed ${numAmount} coins from ${user.name}`,
        },
      }),
    ]);

    res.json({
      message: 'Coins reclaimed successfully',
      userBalance: updatedUser.coinBalance,
      wallet: wallet ? formatWallet(updatedWallet) : undefined,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Get All Transactions
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(transactions.map(formatTransaction));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Get User Wallet
export const getMyWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      coinBalance: user?.coinBalance || 0,
      transactions: transactions.map(formatTransaction),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
