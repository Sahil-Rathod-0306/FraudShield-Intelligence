import "dotenv/config";

import app from "./app.js";
import { connectDatabase } from "./config/datebase.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `🛡️ FraudShield API running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);

    process.exit(1);
  }
};

startServer();