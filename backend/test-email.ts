import "dotenv/config";
// @ts-ignore email.service.js does not provide a TypeScript declaration.
import { transporter } from "./src/services/email.service.js";

async function testEmail() {
  try {
    console.log("Testing Gmail SMTP...");

    console.log({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: Number(process.env.SMTP_PORT) === 465,
    });

    await transporter.verify();

    console.log("✅ Gmail SMTP connected successfully!");
    console.log("✅ Authentication successful!");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);
  }
}

testEmail();