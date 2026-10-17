import nodemailer from "nodemailer";


const smtpPort = Number(process.env.SMTP_PORT || 587);

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort === 587,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD?.replace(/\s/g, ""),
  },

  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});
export const sendVerificationEmail = async (
  email,
  verificationLink
) => {
  try {
    const info = await transporter.sendMail({
      from: `"FraudShield Intelligence" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email - FraudShield Intelligence",
      html: `
        <h2>Welcome to FraudShield Intelligence</h2>

        <p>Please verify your email address.</p>

        <a href="${verificationLink}">
          Verify Email
        </a>

        <p>If you did not create an account, ignore this email.</p>
      `,
    });

    console.log("Verification email sent:", info.messageId);

    return true;
  } catch (error) {
    console.error("SMTP EMAIL ERROR:", error);
    throw new Error("Unable to send verification email");
  }
};