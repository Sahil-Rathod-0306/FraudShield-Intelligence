import nodemailer
  from "nodemailer";


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(
  value: string
) {

  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


// =====================================================
// CREATE TRANSPORTER
// =====================================================

function createTransporter() {

  const host =
    process.env.SMTP_HOST;


  const port =
    Number(
      process.env.SMTP_PORT ||
      587
    );


  const user =
    process.env.SMTP_USER;


  const pass =
    process.env.SMTP_PASS;


  if (
    !host ||
    !user ||
    !pass
  ) {

    throw new Error(
      "SMTP configuration is missing"
    );
  }


  return nodemailer.createTransport({

    host,

    port,

    secure:
      port === 465,

    auth: {

      user,

      pass,

    },

  });
}


// =====================================================
// SEND VERIFICATION EMAIL
// =====================================================

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;

  name: string;

  token: string;
}) {

  const transporter =
    createTransporter();


  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";


  const verificationUrl =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(
      token
    )}`;


  const safeName =
    escapeHtml(name);


  const mailFrom =
    process.env.MAIL_FROM ||
    process.env.SMTP_USER;


  await transporter.sendMail({

    from:
      mailFrom,

    to:
      email,

    subject:
      "Verify your FraudShield account",

    text:
      `Hello ${name},

Welcome to FraudShield Intelligence.

Verify your email by opening this link:

${verificationUrl}

This verification link will expire soon.

If you did not create this account, you can ignore this email.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        background: #020617;
        color: #ffffff;
        border-radius: 16px;
      ">

        <h1 style="
          color: #22d3ee;
          margin-bottom: 8px;
        ">
          FraudShield Intelligence
        </h1>

        <p style="
          color: #94a3b8;
        ">
          Explainable AI Fraud Detection & Investigation
        </p>

        <hr style="
          border: 0;
          border-top: 1px solid #1e293b;
          margin: 24px 0;
        " />

        <h2>
          Verify your email
        </h2>

        <p style="
          color: #cbd5e1;
          line-height: 1.7;
        ">
          Hello ${safeName},
        </p>

        <p style="
          color: #cbd5e1;
          line-height: 1.7;
        ">
          Your FraudShield account has been created.
          Click the button below to verify your email address.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            margin-top: 18px;
            background: #22d3ee;
            color: #020617;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 10px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>

        <p style="
          margin-top: 30px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        ">
          If you did not create this account,
          you can safely ignore this email.
        </p>

      </div>
    `,

  });
}