import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import coinRoutes from './routes/coinRoutes';
import orderRoutes from './routes/orderRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/privacy-policy', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Choice Electricals</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 800px;
            margin: 40px auto;
            padding: 40px;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
            border: 1px solid #e2e8f0;
        }
        h1 {
            color: #1e3a8a;
            font-size: 2.25rem;
            margin-top: 0;
            margin-bottom: 24px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 12px;
        }
        h2 {
            color: #1e3a8a;
            font-size: 1.5rem;
            margin-top: 32px;
            margin-bottom: 16px;
        }
        p, li {
            font-size: 1rem;
            color: #475569;
        }
        ul {
            padding-left: 20px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 0.875rem;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated: June 2, 2026</strong></p>
        
        <p>Choice Electricals ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our mobile application ("Choice Electricals App").</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect and process the following types of information:</p>
        <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address that you provide when creating an account or completing orders.</li>
            <li><strong>Transaction Data:</strong> Details of orders you make and transaction history using our virtual wallet system (coins).</li>
            <li><strong>Device Info:</strong> Technical data such as device model, OS version, and network connection parameters necessary to ensure application security and compatibility.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
            <li>To provide and maintain our services, including processing store orders and managing virtual wallet balances.</li>
            <li>To manage and secure user accounts.</li>
            <li>To provide customer support and respond to requests.</li>
            <li>To improve application performance, security, and stability.</li>
        </ul>

        <h2>3. Data Sharing and Third Parties</h2>
        <p>We do not sell, rent, or trade your personal information to third parties. We only share information with third-party service providers (such as hosting and database services) necessary to run the application, and only under strict confidentiality terms.</p>

        <h2>4. Data Retention and Security</h2>
        <p>We implement appropriate technical and organizational security measures to protect your data from unauthorized access, loss, or alteration. We retain your personal data only as long as necessary to provide our services and satisfy legal or billing requirements.</p>

        <h2>5. Your Rights and Deletion Requests</h2>
        <p>You have the right to access, correct, or request the deletion of your personal data. If you wish to delete your account or any associated personal details, please contact us at <strong>support@choiceelectricals.com</strong>.</p>

        <h2>6. Contact Us</h2>
        <p>If you have any questions or concerns regarding this Privacy Policy, please contact us:</p>
        <p>Choice Electricals Support<br>Email: <strong>support@choiceelectricals.com</strong></p>

        <div class="footer">
            Choice Electricals &copy; 2026. All rights reserved.
        </div>
    </div>
</body>
</html>`);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
