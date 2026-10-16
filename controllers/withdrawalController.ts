import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. User Requests Cash Withdrawal / Store Pickup
export const requestWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { points, notes } = req.body;
    const pointsNum = Number(points);

    if (isNaN(pointsNum) || pointsNum <= 0) {
      res.status(400).json({ message: 'Please enter a valid points amount to withdraw.' });
      return;
    }

    // Minimum withdrawal check (e.g., minimum 50 points = ₹50)
    if (pointsNum < 50) {
      res.status(400).json({ message: 'Minimum cash withdrawal is 50 points (₹50).' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.coinBalance < pointsNum) {
      res.status(400).json({ 
        message: `Insufficient points balance. You currently have ${user.coinBalance} points.` 
      });
      return;
    }

    // 1 Point = ₹1 Cash
    const cashAmount = pointsNum;

    // Atomically decrement points balance, create withdrawal request, and log transaction
    const [updatedUser, withdrawal] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { coinBalance: { decrement: pointsNum } },
      }),
      prisma.cashWithdrawal.create({
        data: {
          userId: user.id,
          points: pointsNum,
          cashAmount: cashAmount,
          status: 'pending',
          notes: notes || 'Store Cash Collection Request',
        },
        include: {
          user: {
            select: { id: true, name: true, phoneNumber: true, email: true },
          },
        },
      }),
      prisma.transaction.create({
        data: {
          senderId: user.id,
          receiverId: 'CHOICE_CASH_COUNTER',
          amount: pointsNum,
          transactionType: 'withdrawal',
          note: `Cash Payout Request: ₹${cashAmount} (${pointsNum} Pts) - Pending Store Collection`,
        },
      }),
    ]);

    res.status(201).json({
      message: 'Cash payout request submitted successfully! Visit Choice Electricals store counter to collect cash.',
      withdrawal,
      remainingPoints: updatedUser.coinBalance,
    });
  } catch (error: any) {
    console.error('requestWithdrawal error:', error);
    res.status(500).json({ message: 'Failed to submit withdrawal request', error: error.message });
  }
};

// 2. User gets their own withdrawal requests
export const getMyWithdrawals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const list = await prisma.cashWithdrawal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(list);
  } catch (error: any) {
    console.error('getMyWithdrawals error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawal history' });
  }
};

// 3. Admin gets all withdrawal requests (with user details)
export const getAllWithdrawals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const withdrawals = await prisma.cashWithdrawal.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
            coinBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(withdrawals);
  } catch (error: any) {
    console.error('getAllWithdrawals error:', error);
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
};

// 4. Admin approves cash withdrawal & marks paid at store counter
export const approveWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const withdrawal = await prisma.cashWithdrawal.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawal) {
      res.status(404).json({ message: 'Withdrawal request not found' });
      return;
    }

    if (withdrawal.status !== 'pending') {
      res.status(400).json({ message: `Cannot approve. Request is already ${withdrawal.status}.` });
      return;
    }

    const updated = await prisma.cashWithdrawal.update({
      where: { id },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        adminNotes: adminNotes || 'Cash handed over at store counter',
      },
      include: {
        user: {
          select: { id: true, name: true, phoneNumber: true, email: true },
        },
      },
    });

    res.json({
      message: `Cash payout of ₹${withdrawal.cashAmount} marked as Paid & Collected.`,
      withdrawal: updated,
    });
  } catch (error: any) {
    console.error('approveWithdrawal error:', error);
    res.status(500).json({ message: 'Failed to approve withdrawal', error: error.message });
  }
};

// 5. Admin rejects withdrawal and refunds points back to the electrician
export const rejectWithdrawal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await prisma.cashWithdrawal.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!withdrawal) {
      res.status(404).json({ message: 'Withdrawal request not found' });
      return;
    }

    if (withdrawal.status !== 'pending') {
      res.status(400).json({ message: `Cannot reject. Request is already ${withdrawal.status}.` });
      return;
    }

    // Atomically reject request, refund points, and log refund transaction
    const [updatedWithdrawal, updatedUser] = await prisma.$transaction([
      prisma.cashWithdrawal.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          adminNotes: reason || 'Request rejected by store administrator',
        },
        include: {
          user: {
            select: { id: true, name: true, phoneNumber: true, email: true },
          },
        },
      }),
      prisma.user.update({
        where: { id: withdrawal.userId },
        data: { coinBalance: { increment: withdrawal.points } },
      }),
      prisma.transaction.create({
        data: {
          senderId: 'CHOICE_CASH_COUNTER',
          receiverId: withdrawal.userId,
          amount: withdrawal.points,
          transactionType: 'refund',
          note: `Refund: ${withdrawal.points} points restored for rejected cash withdrawal #${withdrawal.id.slice(0, 8)}`,
        },
      }),
    ]);

    res.json({
      message: `Withdrawal request rejected. ${withdrawal.points} points refunded to user.`,
      withdrawal: updatedWithdrawal,
      newUserBalance: updatedUser.coinBalance,
    });
  } catch (error: any) {
    console.error('rejectWithdrawal error:', error);
    res.status(500).json({ message: 'Failed to reject withdrawal', error: error.message });
  }
};
