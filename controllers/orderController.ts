import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const formatOrder = (o: any) => ({
  _id: o.id,
  id: o.id,
  user: o.user
    ? {
        _id: o.user.id,
        id: o.user.id,
        name: o.user.name,
        email: o.user.email,
        phoneNumber: o.user.phoneNumber,
      }
    : o.userId,
  product: o.product
    ? {
        _id: o.product.id,
        id: o.product.id,
        name: o.product.name,
        images: Array.isArray(o.product.images)
          ? o.product.images
          : (typeof o.product.images === 'string' ? JSON.parse(o.product.images) : []),
      }
    : o.productId,
  coinsSpent: o.coinsSpent,
  quantity: o.quantity,
  status: o.status,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
});

export const buyProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);

    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!user || !product) {
      res.status(404).json({ message: 'User or Product not found' });
      return;
    }

    if (product.status === 'blocked') {
      res.status(400).json({ message: 'Product is currently unavailable' });
      return;
    }

    if (product.stock < qty) {
      res.status(400).json({ message: 'Insufficient stock' });
      return;
    }

    const totalCoins = product.priceInCoins * qty;

    if (user.coinBalance < totalCoins) {
      res.status(400).json({ message: 'Insufficient coin balance' });
      return;
    }

    // Execute atomic transaction for coin deduction, stock reduction, order creation, transaction log
    const [updatedUser, updatedProduct, order] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { coinBalance: { decrement: totalCoins } },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: qty } },
      }),
      prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          coinsSpent: totalCoins,
          quantity: qty,
          status: 'pending',
        },
        include: { product: true, user: true },
      }),
      prisma.transaction.create({
        data: {
          senderId: user.id,
          receiverId: 'SYSTEM_STORE',
          amount: totalCoins,
          transactionType: 'purchase',
          note: `Purchased ${qty}x ${product.name}`,
        },
      }),
    ]);

    res.status(201).json({
      message: 'Purchase Request sent for admin approval',
      order: formatOrder(order),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders.map(formatOrder));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(formatOrder));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'pending' },
      include: { user: true, product: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders.map(formatOrder));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true, product: true },
    });

    if (!order || order.status !== 'pending') {
      res.status(404).json({ message: 'Pending order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'approved' },
      include: { user: true, product: true },
    });

    res.json({ message: 'Order approved', order: formatOrder(updated) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order || order.status !== 'pending') {
      res.status(404).json({ message: 'Pending order not found' });
      return;
    }

    // Atomic transaction for order rejection, refunding user coins, restocking product, refund transaction
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'rejected' },
        include: { user: true, product: true },
      }),
      prisma.user.update({
        where: { id: order.userId },
        data: { coinBalance: { increment: order.coinsSpent } },
      }),
      prisma.product.update({
        where: { id: order.productId },
        data: { stock: { increment: order.quantity } },
      }),
      prisma.transaction.create({
        data: {
          senderId: 'SYSTEM_STORE',
          receiverId: order.userId,
          amount: order.coinsSpent,
          transactionType: 'reclaim',
          note: `Refund for rejected order #${order.id}`,
        },
      }),
    ]);

    res.json({ message: 'Order rejected and coins/stock refunded', order: formatOrder(updatedOrder) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
