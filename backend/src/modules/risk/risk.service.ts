interface TransactionRiskInput {
  amount: number;
  transactionTime?: Date;
  deviceId?: string;
  ipAddress?: string;
}

interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
}

export const calculateRuleRisk = (
  transaction: TransactionRiskInput
): RiskResult => {
  let score = 0;

  const reasons: string[] = [];

  // -------------------------
  // Amount Risk
  // -------------------------

  if (transaction.amount >= 100000) {
    score += 35;
    reasons.push(
      "Very high transaction amount detected"
    );
  } else if (transaction.amount >= 50000) {
    score += 25;
    reasons.push(
      "High transaction amount detected"
    );
  } else if (transaction.amount >= 20000) {
    score += 10;
    reasons.push(
      "Transaction amount is above normal threshold"
    );
  }

  // -------------------------
  // Time Risk
  // -------------------------

  const transactionDate =
    transaction.transactionTime ?? new Date();

  const hour = transactionDate.getHours();

  if (hour >= 0 && hour < 5) {
    score += 15;

    reasons.push(
      "Transaction occurred during unusual hours"
    );
  }

  // -------------------------
  // Device Risk
  // -------------------------

  if (!transaction.deviceId) {
    score += 10;

    reasons.push(
      "Device information is missing"
    );
  }

  // -------------------------
  // IP Risk
  // -------------------------

  if (!transaction.ipAddress) {
    score += 10;

    reasons.push(
      "IP address information is missing"
    );
  }

  score = Math.min(score, 100);

  let level: RiskResult["level"] = "LOW";

  if (score >= 80) {
    level = "CRITICAL";
  } else if (score >= 60) {
    level = "HIGH";
  } else if (score >= 30) {
    level = "MEDIUM";
  }

  return {
    score,
    level,
    reasons,
  };
};