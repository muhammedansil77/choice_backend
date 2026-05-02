import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middlewares/authMiddleware';

export const buyProduct = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId, variantColor, variantSizeOrName, quantity = 1 } = req.body;
        const qty = Number(quantity);

        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const user = await User.findById(req.user._id);
        const product = await Product.findById(productId);

        if (!user || !product) {
            res.status(404).json({ message: 'User or Product not found' });
            return;
        }

        if (product.status === 'blocked') {
            res.status(400).json({ message: 'Product is currently unavailable' });
            return;
        }

        const variantIndex = product.variants.findIndex(
            v => v.color === variantColor && v.sizeOrName === variantSizeOrName
        );

        if (variantIndex === -1) {
            res.status(404).json({ message: 'Variant not found' });
            return;
        }

        const variant = product.variants[variantIndex];

        if (variant.stock < qty) {
            res.status(400).json({ message: 'Insufficient stock' });
            return;
        }

        const totalCoins = product.priceInCoins * qty;

        if (user.coinBalance < totalCoins) {
            res.status(400).json({ message: 'Insufficient coin balance' });
            return;
        }

        user.coinBalance -= totalCoins;
        await user.save();

        product.variants[variantIndex].stock -= qty;
        await product.save();

        const order = await Order.create({
            user: user._id,
            product: product._id,
            variant: {
                color: variant.color,
                sizeOrName: variant.sizeOrName
            },
            coinsSpent: totalCoins,
            quantity: qty
        });

        await Transaction.create({
            user: user._id,
            amount: totalCoins,
            type: 'purchase',
            description: `Purchased ${qty}x ${product.name} (${variant.color}, ${variant.sizeOrName})`
        });

        res.status(201).json({ message: 'Purchase Request sent for admin approval', order });
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

        const orders = await Order.find({ user: req.user._id })
            .populate('product', 'name images')
            .sort('-createdAt');
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find().populate('user', 'name email').populate('product', 'name images').sort('-createdAt');
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ status: 'pending' })
            .populate('user', 'name email phoneNumber')
            .populate('product', 'name images')
            .sort('createdAt');
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.status !== 'pending') {
            res.status(404).json({ message: 'Pending order not found' });
            return;
        }
        order.status = 'approved';
        await order.save();
        res.json({ message: 'Order approved', order });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || order.status !== 'pending') {
            res.status(404).json({ message: 'Pending order not found' });
            return;
        }
        order.status = 'rejected';
        await order.save();
        
        // Refund coins
        const user = await User.findById(order.user);
        if (user) {
            user.coinBalance += order.coinsSpent;
            await user.save();
        }
        
        // Refund stock
        const product = await Product.findById(order.product);
        if (product) {
            const variantIndex = product.variants.findIndex(v => v.color === order.variant.color && v.sizeOrName === order.variant.sizeOrName);
            if (variantIndex !== -1) {
                product.variants[variantIndex].stock += order.quantity;
                await product.save();
            }
        }
        
        res.json({ message: 'Order rejected and coins/stock refunded', order });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
