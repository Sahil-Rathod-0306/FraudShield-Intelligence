import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import transactionRoutes from "./modules/transactions/transaction.routes.js";
import fraudCaseRoutes from "./modules/cases/fraud-case.routes.js";
import aiInvestigatorRoutes from "./modules/investigation/ai-investigator.routes.js";
import dashboardRoutes
  from "./modules/dashboard/dashboard.routes.js";

  import authRoutes
  from "./modules/auth/auth.routes.js";

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);



app.use(express.json());

app.use(morgan("dev"));


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "FraudShield Backend",
    status: "healthy",
  });
});


// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/v1/auth",
  authRoutes
);

app.use(
  "/api/v1/transactions",
  transactionRoutes
);

app.use(
  "/api/v1/cases",
  fraudCaseRoutes
);

app.use(
  "/api/v1/ai",
  aiInvestigatorRoutes
);

app.use(
  "/api/v1/dashboard",
  dashboardRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});


export default app;