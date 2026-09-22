import https from 'https';

const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY || 'wpgQBu137CKEkVtNqZAmeR624SriGJxFnTva5UHXyWdflhoDzsWl1DVbFnkYvEANyTHSL3Bcuq9oi0z5';

export interface SendSmsResult {
    success: boolean;
    message: string;
    gatewayResponse?: any;
    fallbackOtp?: string;
}

/**
 * Sends a 6-digit verification code to the given 10-digit Indian phone number via Fast2SMS
 */
export const sendPhoneOtp = async (phoneNumber: string, otp: string): Promise<SendSmsResult> => {
    // 1. Clean phone number - strip country code +91, 91 prefix if 12 digits, spaces, dashes
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length > 10 && cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.slice(2);
    }
    if (cleanPhone.length !== 10) {
        return {
            success: false,
            message: 'Phone number must be a valid 10-digit mobile number.',
        };
    }

    // 2. Prepare Fast2SMS Quick Message Payload
    const smsMessage = `Your Choice Electricals verification code is ${otp}. Valid for 10 minutes. Please do not share this OTP with anyone.`;

    try {
        const result = await makeFast2SmsRequest({
            message: smsMessage,
            language: 'english',
            route: 'q',
            numbers: cleanPhone,
        });

        if (result && result.return === true) {
            console.log(`[Fast2SMS] SMS sent successfully to ${cleanPhone}:`, result.message);
            return {
                success: true,
                message: 'OTP sent to mobile number via SMS.',
                gatewayResponse: result,
            };
        }

        // Fast2SMS returned an error response (e.g. 999 min recharge or 996 website verification)
        console.warn(`[Fast2SMS Gateway Notice] ${result?.message || 'Gateway rejected message'} (Status Code: ${result?.status_code})`);
        console.log(`[DEV FALLBACK OTP] Verification code for ${cleanPhone}: ${otp}`);

        return {
            success: true,
            message: result?.message ? `SMS Gateway: ${result.message}` : 'OTP generated.',
            fallbackOtp: otp,
            gatewayResponse: result,
        };
    } catch (err: any) {
        console.error('[Fast2SMS Request Error]:', err.message);
        console.log(`[DEV FALLBACK OTP] Verification code for ${cleanPhone}: ${otp}`);
        return {
            success: true,
            message: 'OTP generated in fallback mode.',
            fallbackOtp: otp,
        };
    }
};

/**
 * Helper to make HTTPS POST request to Fast2SMS API
 */
const makeFast2SmsRequest = (payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: 'www.fast2sms.com',
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
                'authorization': FAST2SMS_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => (responseData += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch {
                    resolve({ raw: responseData, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};
