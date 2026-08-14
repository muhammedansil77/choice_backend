import nodemailer from 'nodemailer';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'ansilansu27@gmail.com',
            pass: process.env.EMAIL_PASS || '',
        },
    });
};

export const sendOtpEmail = async (toEmail: string, otp: string): Promise<boolean> => {
    try {
        const transporter = getTransporter();
        const mailOptions = {
            from: `"Choice Electricals" <${process.env.EMAIL_USER || 'ansilansu27@gmail.com'}>`,
            to: toEmail,
            subject: `${otp} is your Choice Electricals verification code`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #1E3A8A; margin: 0;">Choice Electricals</h2>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Account Registration Verification</p>
                    </div>
                    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <p style="color: #374151; font-size: 14px; margin-bottom: 10px;">Your 6-digit OTP code is:</p>
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3B82F6;">${otp}</span>
                    </div>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>. If you did not request this verification, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Choice Electricals. All rights reserved.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};
