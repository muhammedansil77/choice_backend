import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aoppp_mobile_app');

        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            coinBalance: 0,
            role: 'admin',
            status: 'active',
        });

        console.log('Admin user seeded to the database.');
        process.exit();
    } catch (error) {
        console.error(`Error:`, error);
        process.exit(1);
    }
};

seedAdmin();
