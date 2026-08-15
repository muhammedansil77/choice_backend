import prisma from '../prisma';

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('MySQL Database Connected successfully via Prisma ORM!');
    } catch (error: any) {
        console.error(`Database Connection Error: ${error.message}`);
    }
};

export default connectDB;
