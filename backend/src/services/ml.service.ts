// =====================================================
// ML SERVICE
// =====================================================


// =====================================================
// ML PREDICTION TYPES
// =====================================================

export interface MLPredictionInput {
  amount: number;
  transactionType: string;
}


export interface MLPredictionResult {
  available: boolean;

  mlRisk: number;

  probability: number;

  prediction:
    | "FRAUD"
    | "LEGITIMATE"
    | "UNAVAILABLE";

  modelVersion: string;

  modelName: string;
}


// =====================================================
// GET ML PREDICTION
// =====================================================

export const getMLPrediction = async (
  input: MLPredictionInput
): Promise<MLPredictionResult> => {
  const mlServiceUrl =
    process.env.ML_SERVICE_URL ??
    "http://localhost:8000";

  try {
    const response = await fetch(
      `${mlServiceUrl}/predict`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: input.amount,
          transactionType: input.transactionType,
        }),
      }
    );

    // -----------------------------------------------------
    // CHECK RESPONSE STATUS
    // -----------------------------------------------------

    if (!response.ok) {
      throw new Error(
        `ML service returned status ${response.status}`
      );
    }

    // -----------------------------------------------------
    // RESPONSE TYPE
    // -----------------------------------------------------

    const data = (await response.json()) as {
      mlRisk: number;

      fraudProbability: number;

      prediction:
        | "FRAUD"
        | "LEGITIMATE";

      modelVersion: string;

      modelName?: string;
    };

    // -----------------------------------------------------
    // RETURN ML RESULT
    // -----------------------------------------------------

    return {
      available: true,

      mlRisk:
        typeof data.mlRisk === "number"
          ? data.mlRisk
          : 0,

      probability:
        typeof data.fraudProbability === "number"
          ? data.fraudProbability
          : 0,

      prediction:
        data.prediction === "FRAUD"
          ? "FRAUD"
          : "LEGITIMATE",

      modelVersion:
        data.modelVersion ??
        "unknown",

      modelName:
        data.modelName ??
        "FraudShield ML",
    };
  } catch (error) {
    console.error(
      "ML Service Error:",
      error
    );

    /*
      Important:

      FraudShield backend should continue
      functioning even when the Python
      ML service is offline.
    */

    return {
      available: false,

      mlRisk: 0,

      probability: 0,

      prediction:
        "UNAVAILABLE",

      modelVersion:
        "unavailable",

      modelName:
        "unavailable",
    };
  }
};


// =====================================================
// ML EXPLANATION TYPES
// =====================================================

export interface MLExplanationItem {
  feature: string;

  value:
    | number
    | string
    | boolean
    | null;

  contribution: number;
}


export interface MLExplanationResult {
  available: boolean;

  prediction:
    | "FRAUD"
    | "LEGITIMATE"
    | "UNAVAILABLE";

  probability: number;

  mlRisk: number;

  modelVersion: string;

  modelName: string;

  explanation: MLExplanationItem[];
}


// =====================================================
// ML EXPLANATION INPUT
// =====================================================

export interface MLExplanationInput {
  amount: number;

  transactionType: string;
}


// =====================================================
// GET ML EXPLANATION
// =====================================================

export const getMLExplanation = async (
  input: MLExplanationInput
): Promise<MLExplanationResult> => {
  const mlServiceUrl =
    process.env.ML_SERVICE_URL ??
    "http://localhost:8000";

  try {
    const response = await fetch(
      `${mlServiceUrl}/explain`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          amount:
            input.amount,

          transactionType:
            input.transactionType,
        }),
      }
    );

    // -----------------------------------------------------
    // CHECK RESPONSE STATUS
    // -----------------------------------------------------

    if (!response.ok) {
      throw new Error(
        `ML explanation service returned status ${response.status}`
      );
    }

    // -----------------------------------------------------
    // RESPONSE TYPE
    // -----------------------------------------------------

    const data = (await response.json()) as {
      prediction:
        | "FRAUD"
        | "LEGITIMATE";

      fraudProbability: number;

      mlRisk: number;

      modelVersion: string;

      modelName?: string;

      explanation?:
        MLExplanationItem[];
    };

    // -----------------------------------------------------
    // RETURN EXPLANATION
    // -----------------------------------------------------

    return {
      available: true,

      prediction:
        data.prediction === "FRAUD"
          ? "FRAUD"
          : "LEGITIMATE",

      probability:
        typeof data.fraudProbability === "number"
          ? data.fraudProbability
          : 0,

      mlRisk:
        typeof data.mlRisk === "number"
          ? data.mlRisk
          : 0,

      modelVersion:
        data.modelVersion ??
        "unknown",

      modelName:
        data.modelName ??
        "FraudShield ML",

      explanation:
        Array.isArray(data.explanation)
          ? data.explanation
          : [],
    };
  } catch (error) {
    console.error(
      "ML Explanation Error:",
      error
    );

    return {
      available: false,

      prediction:
        "UNAVAILABLE",

      probability: 0,

      mlRisk: 0,

      modelVersion:
        "unavailable",

      modelName:
        "unavailable",

      explanation: [],
    };
  }
};