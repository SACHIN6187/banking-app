const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, text) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // change after domain verification
      to,
      subject,
      text,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(
      error.message || "Failed to send email"
    );
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
  const SUBJECT =
    "Your OTP for Account Verification - Vault Banking";

  const TEXT = `Your One-Time Password (OTP) for account verification is: ${OTP}

This OTP will expire in 5 minutes.

IMPORTANT SECURITY REMINDERS:
- Never share your OTP with anyone
- Bank staff will never ask for your OTP or password
- If you didn't request this OTP, please ignore this email

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
