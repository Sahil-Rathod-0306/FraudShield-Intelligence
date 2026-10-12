import Transaction from "../transactions/transaction.model.js";

interface BehaviorRiskInput {
  customerId: string;
  amount: number;

  deviceId?: string;

  location?: {
    city?: string;
    state?: string;
    country?: string;
  };

  transactionTime: Date;
}

export interface BehaviorRiskResult {
  score: number;

  reasons: string[];

  historyCount: number;

  hasSufficientHistory: boolean;

  signals: {
    averageAmount: number | null;
    amountRatio: number | null;

    isNewDevice: boolean | null;
    isNewLocation: boolean | null;
    unusualHour: boolean | null;

    recent10MinCount: number;
  };
}

export const calculateBehaviorRisk = async (
  input: BehaviorRiskInput
): Promise<BehaviorRiskResult> => {

  let score = 0;

  const reasons: string[] = [];

  // Get previous transactions of this customer
  const history = await Transaction.find({
    customerId: input.customerId,

    transactionTime: {
      $lt: input.transactionTime,
    },
  })
    .sort({
      transactionTime: -1,
    })
    .limit(50)
    .lean();

  const historyCount = history.length;

  // We need some history before making
  // personalized behavioral decisions
  const hasSufficientHistory =
    historyCount >= 5;

  const signals = {
    averageAmount: null as number | null,

    amountRatio: null as number | null,

    isNewDevice: null as boolean | null,

    isNewLocation: null as boolean | null,

    unusualHour: null as boolean | null,

    recent10MinCount: 0,
  };

  // --------------------------------
  // Transaction Velocity
  // --------------------------------

  const tenMinutesAgo = new Date(
    input.transactionTime.getTime() -
      10 * 60 * 1000
  );

  const recent10MinCount =
    await Transaction.countDocuments({
      customerId: input.customerId,

      transactionTime: {
        $gte: tenMinutesAgo,
        $lt: input.transactionTime,
      },
    });

  signals.recent10MinCount =
    recent10MinCount;

  if (recent10MinCount >= 5) {

    score += 30;

    reasons.push(
      "Very high transaction frequency detected"
    );

  } else if (recent10MinCount >= 3) {

    score += 15;

    reasons.push(
      "Multiple transactions detected within 10 minutes"
    );
  }

  // Stop personalized checks if
  // we don't have enough history yet
  if (!hasSufficientHistory) {

    return {
      score: Math.min(score, 100),

      reasons,

      historyCount,

      hasSufficientHistory,

      signals,
    };
  }

  // --------------------------------
  // Average Transaction Amount
  // --------------------------------

  const totalAmount = history.reduce(
    (sum, transaction) =>
      sum + Number(transaction.amount || 0),
    0
  );

  const averageAmount =
    totalAmount / historyCount;

  signals.averageAmount =
    Number(averageAmount.toFixed(2));

  if (averageAmount > 0) {

    const ratio =
      input.amount / averageAmount;

    signals.amountRatio =
      Number(ratio.toFixed(2));

    if (ratio >= 10) {

      score += 35;

      reasons.push(
        `Transaction amount is ${ratio.toFixed(
          1
        )}x higher than the customer's average`
      );

    } else if (ratio >= 5) {

      score += 25;

      reasons.push(
        `Transaction amount is ${ratio.toFixed(
          1
        )}x higher than normal`
      );

    } else if (ratio >= 3) {

      score += 15;

      reasons.push(
        "Transaction amount is significantly higher than normal"
      );
    }
  }

  // --------------------------------
  // New Device Detection
  // --------------------------------

  if (input.deviceId) {

    const knownDevice =
      history.some(
        (transaction) =>
          transaction.deviceId ===
          input.deviceId
      );

    signals.isNewDevice =
      !knownDevice;

    if (!knownDevice) {

      score += 20;

      reasons.push(
        "Transaction originated from a new device"
      );
    }
  }

  // --------------------------------
  // New Location Detection
  // --------------------------------

  if (input.location?.city) {

    const currentCity =
      input.location.city
        .trim()
        .toLowerCase();

    const knownLocation =
      history.some(
        (transaction) =>
          transaction.location?.city
            ?.trim()
            .toLowerCase() ===
          currentCity
      );

    signals.isNewLocation =
      !knownLocation;

    if (!knownLocation) {

      score += 15;

      reasons.push(
        "Transaction originated from an unusual location"
      );
    }
  }

  // --------------------------------
  // Unusual Time Detection
  // --------------------------------

  const currentHour =
    input.transactionTime.getHours();

  const previousHours =
    history
      .filter(
        (transaction) =>
          transaction.transactionTime
      )
      .map(
        (transaction) =>
          new Date(
            transaction.transactionTime
          ).getHours()
      );

  const hasSimilarHour =
    previousHours.some((hour) => {

      const difference =
        Math.abs(
          hour - currentHour
        );

      // Circular clock difference:
      // 23:00 and 01:00 = 2 hours apart
      const circularDifference =
        Math.min(
          difference,
          24 - difference
        );

      return circularDifference <= 2;
    });

  signals.unusualHour =
    !hasSimilarHour;

  if (!hasSimilarHour) {

    score += 15;

    reasons.push(
      "Transaction occurred outside the customer's usual activity hours"
    );
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons,
    historyCount,
    hasSufficientHistory,
    signals,
  };
};