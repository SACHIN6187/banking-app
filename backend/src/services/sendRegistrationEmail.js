const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendEmail = async (to, subject, text) => {
  try {
    // SECURITY: Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
          'Email credentials not configured in environment variables');
      throw new Error('Email service not properly configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      // Add reply-to for security
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const SUBJECT = 'Welcome to Vault Banking - Account Created Successfully';
  const TEXT = `Hi ${name},

Welcome to Vault Banking! Your account has been successfully created and verified.

You can now access your dashboard to:
- Create bank accounts
- Send and receive money
- View transaction history
- Manage your profile

Security Tips:
- Never share your password or OTP with anyone
- Always use a strong, unique password
- Enable two-factor authentication for extra security
- Bank staff will never ask for your password

Next Steps:
1. Log in to your account: https://vault-banking.com/login
2. Complete your profile
3. Create your first bank account
4. Start making secure transactions

If you have any questions, visit our Help Center or contact support.

Best regards,
The Vault Banking Team

For support: support@vault-banking.com`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}


async function sendDebitEmail(userEmail, name, amount, transactionId) {
  const SUBJECT = 'Transaction Completed - Money Sent';
  const TEXT = `Hi,

You have successfully sent ₹${amount} to ${name}.

Transaction Details:
- Amount: ₹${amount}
- Recipient: ${name}
- Transaction ID: ${transactionId || 'N/A'}
- Date & Time: ${new Date().toLocaleString()}
- Status: Completed

This amount has been deducted from your account.

If you did not authorize this transaction, please contact our support team immediately.

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}


async function sendCreditEmail(userEmail, name, amount, transactionId) {
  const SUBJECT = 'Money Received - Transaction Completed';
  const TEXT = `Hi,

You have successfully received ₹${amount} from ${name}.

Transaction Details:
- Amount: ₹${amount}
- Sender: ${name}
- Transaction ID: ${transactionId || 'N/A'}
- Date & Time: ${new Date().toLocaleString()}
- Status: Completed

This amount has been credited to your account.

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

async function sendOtpMail(userEmail, OTP) {
  const SUBJECT = 'Your OTP for Account Verification - Vault Banking';
  const TEXT = `Your One-Time Password (OTP) for account verification is: ${OTP}

This OTP will expire in 5 minutes.

IMPORTANT SECURITY REMINDERS:
- Never share your OTP with anyone
- Bank staff will never ask for your OTP or password
- Always verify you're on the official website before entering your OTP
- If you didn't request this OTP, please ignore this email

Best regards,
The Vault Banking Team

For support: support@vault-banking.com`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

module.exports = {
  sendOtpMail,
  sendRegistrationEmail,
  sendDebitEmail,
  sendCreditEmail
};
