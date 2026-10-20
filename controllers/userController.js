"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getDashboardSummary = exports.addCoins = exports.unblockUser = exports.blockUser = exports.getUsers = exports.createUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const formatUser = (u) => ({
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
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, phoneNumber } = req.body;
        const userExists = yield prisma_1.default.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield prisma_1.default.user.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.registerUser = registerUser;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, coinBalance, phoneNumber } = req.body;
        const userExists = yield prisma_1.default.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield prisma_1.default.user.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createUser = createUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.default.user.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUsers = getUsers;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        if (user) {
            yield prisma_1.default.user.update({
                where: { id },
                data: { status: 'blocked' },
            });
            res.json({ message: 'User blocked' });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        if (user) {
            yield prisma_1.default.user.update({
                where: { id },
                data: { status: 'active' },
            });
            res.json({ message: 'User unblocked' });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.unblockUser = unblockUser;
const addCoins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { amount, note } = req.body;
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            res.status(400).json({ message: 'Invalid coin amount' });
            return;
        }
        const user = yield prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        let wallet = yield prisma_1.default.adminWallet.findFirst();
        if (!wallet || wallet.remainingCoins < numAmount) {
            res.status(400).json({ message: 'Insufficient admin supply' });
            return;
        }
        const [updatedUser, updatedWallet] = yield prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id },
                data: { coinBalance: { increment: numAmount } },
            }),
            prisma_1.default.adminWallet.update({
                where: { id: wallet.id },
                data: {
                    distributedCoins: { increment: numAmount },
                    remainingCoins: { decrement: numAmount },
                },
            }),
            prisma_1.default.transaction.create({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.addCoins = addCoins;
const getDashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userCount = yield prisma_1.default.user.count({ where: { role: 'user' } });
        const adminCount = yield prisma_1.default.user.count({ where: { role: 'admin' } });
        const productCount = yield prisma_1.default.product.count();
        const transactions = yield prisma_1.default.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        const wallet = yield prisma_1.default.adminWallet.findFirst();
        res.json({
            users: userCount,
            admins: adminCount,
            products: productCount,
            totalCoins: (wallet === null || wallet === void 0 ? void 0 : wallet.totalCoins) || 0,
            remainingCoins: (wallet === null || wallet === void 0 ? void 0 : wallet.remainingCoins) || 0,
            distributedCoins: (wallet === null || wallet === void 0 ? void 0 : wallet.distributedCoins) || 0,
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getDashboardSummary = getDashboardSummary;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Not authorized, user not identified' });
            return;
        }
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            res.status(400).json({ message: 'A valid name is required' });
            return;
        }
        const updatedUser = yield prisma_1.default.user.update({
            where: { id: userId },
            data: {
                name: name.trim(),
            },
        });
        res.json(formatUser(updatedUser));
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: error.message || 'Failed to update user profile' });
    }
});
exports.updateUserProfile = updateUserProfile;
