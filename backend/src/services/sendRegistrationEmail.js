const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const SUBJECT = 'Registration Successful - SafeBank';
  const TEXT = `Hi ${name},
  
      Welcome to SafeBank! Your registration is complete.
  
      You can now access your dashboard to perform transactions securely. 
      To get started, log in here: https://your-bank-app.com
  
      Security Tip: Never share your password or OTP with anyone, including bank staff.
  
      Best regards,
      The SafeBank Team`;


  await sendEmail(userEmail, SUBJECT, TEXT);
}


async function sendDebitEmail(userEmail, name, amount) {
  const SUBJECT = 'transaction Successful - SafeBank';
  const TEXT = `You’ve successfully sent ${amount} to ${
      name}. The amount has been deducted from your account. Transaction ID: {transactionId}.
  `;
  await sendEmail(userEmail, SUBJECT, TEXT);
}


async function sendCreditEmail(userEmail, name, amount) {
  const SUBJECT = 'transaction Successful - SafeBank';
  const TEXT = `${amount} has been credited to your account from ${
      name}. Transaction ID: {transactionId}.
`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

async function sendOtpMail(userEmail, OTP) {
  const SUBJECT = ' OTP validation - SafeBank';
  const TEXT = `Hi , Your OTP for sign up is ${OTP}
      Best regards,
      The SafeBank Team`;

  await sendEmail(userEmail, SUBJECT, TEXT);
}

module.exports = {
  sendOtpMail,
  sendRegistrationEmail,
  sendDebitEmail,
  sendCreditEmail
};