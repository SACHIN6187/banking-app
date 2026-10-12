const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  requireTLS: Number(process.env.SMTP_PORT) === 587,

  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  logger: true,
  debug: true,
});

// Verify SMTP connection when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY FAILED");
    console.error(error);
  } else {
    console.log("SMTP SERVER IS READY");
  }
});

async function sendEmail(to, subject, text) {
  try {
    console.log("========== SMTP CONFIG ==========");
    console.log({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: Number(process.env.SMTP_PORT) === 465,
      email: process.env.SMTP_EMAIL,
    });
    console.log("=================================");

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_EMAIL ||
      !process.env.SMTP_PASSWORD
    ) {
      throw new Error("SMTP configuration is missing.");
    }

    console.log(`Sending email to ${to}...`);

    const info = await transporter.sendMail({
      from: `"Vault Banking" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent successfully.");
    console.log(info);

    return info;
  } catch (err) {
    console.error("========== EMAIL ERROR ==========");
    console.error("Message :", err.message);
    console.error("Code    :", err.code);
    console.error("Command :", err.command);
    console.error("Stack   :", err.stack);
    console.error("=================================");

    throw err;
  }
}



async function sendRegistrationEmail(userEmail, name) {
  const SUBJECT =
    "Welcome to Vault Banking - Account Created Successfully";

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

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

async function sendDebitEmail(
  userEmail,
  name,
  amount,
  transactionId
) {
  const SUBJECT = "Transaction Completed - Money Sent";

  const TEXT = `Hi,

You have successfully sent ₹${amount} to ${name}.

Transaction Details:
- Amount: ₹${amount}
- Recipient: ${name}
- Transaction ID: ${transactionId || "N/A"}
- Date & Time: ${new Date().toLocaleString()}
- Status: Completed

This amount has been deducted from your account.

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

async function sendCreditEmail(
  userEmail,
  name,
  amount,
  transactionId
) {
  const SUBJECT = "Money Received - Transaction Completed";

  const TEXT = `Hi,

You have successfully received ₹${amount} from ${name}.

Transaction Details:
- Amount: ₹${amount}
- Sender: ${name}
- Transaction ID: ${transactionId || "N/A"}
- Date & Time: ${new Date().toLocaleString()}
- Status: Completed

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

async function sendOtpMail(userEmail, OTP) {
  console.log('request reach to backend and fucntion successfully');
  const SUBJECT =
    "Your OTP for Account Verification - Vault Banking";

  const TEXT = `Your One-Time Password (OTP) for account verification is: ${OTP}

This OTP will expire in 5 minutes.

IMPORTANT SECURITY REMINDERS:
- Never share your OTP with anyone
- Bank staff will never ask for your OTP or password
- If you didn't request this OTP, please ignore this email.

Best regards,
The Vault Banking Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

module.exports = {
  sendOtpMail,
  sendRegistrationEmail,
  sendDebitEmail,
  sendCreditEmail,
};
