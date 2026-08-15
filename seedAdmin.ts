import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

dotenv.config();

const seedAdmin = async () => {
    try {
        const adminExists = await prisma.user.findUnique({
            where: { email: 'admin@example.com' },
        });

        if (adminExists) {
            console.log('Admin already exists in MySQL database.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                coinBalance: 0,
                role: 'admin',
                status: 'active',
            },
        });

        // Initialize admin wallet if not present
        const wallet = await prisma.adminWallet.findFirst();
        if (!wallet) {
            await prisma.adminWallet.create({
                data: {
                    totalCoins: 1000000,
                    distributedCoins: 0,
                    remainingCoins: 1000000,
                },
            });
            console.log('Initial Admin Wallet seeded with 1,000,000 coins.');
        }

        console.log('Admin user seeded to the MySQL database successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
