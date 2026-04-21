import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password || ''))) {
            if (user.status === 'blocked') {
                res.status(401).json({ message: 'User is blocked' });
                return;
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                coinBalance: user.coinBalance,
                token: generateToken(user._id.toString(), user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
