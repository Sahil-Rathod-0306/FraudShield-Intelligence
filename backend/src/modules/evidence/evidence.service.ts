import FraudEvidence
  from "./fraud-evidence.model.js";

import type {
  MLExplanationItem,
} from "../../services/ml.service.js";


interface CreateEvidenceInput {

  transactionId: string;

  riskAssessmentId: string;

  fraudCaseId?: string | null;

  customerId: string;

  ruleReasons: string[];

  behaviorReasons: string[];

  mlExplanation:
    MLExplanationItem[];

  mlPrediction:
    | "FRAUD"
    | "LEGITIMATE"
    | "UNAVAILABLE";

  mlProbability: number;

  ruleRisk: number;

  behaviorRisk: number;

  mlRisk: number;

  finalRisk: number;

  riskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";
}


export const createFraudEvidence =
  async (
    input: CreateEvidenceInput
  ) => {

    const evidence =
      await FraudEvidence.create({

        transactionId:
          input.transactionId,

        riskAssessmentId:
          input.riskAssessmentId,

        fraudCaseId:
          input.fraudCaseId ?? null,

        customerId:
          input.customerId,

        ruleEvidence:
          input.ruleReasons,

        behaviorEvidence:
          input.behaviorReasons,

        mlEvidence:
          input.mlExplanation,

        mlPrediction:
          input.mlPrediction,

        mlProbability:
          input.mlProbability,

        ruleRisk:
          input.ruleRisk,

        behaviorRisk:
          input.behaviorRisk,

        mlRisk:
          input.mlRisk,

        finalRisk:
          input.finalRisk,

        riskLevel:
          input.riskLevel,
      });


    return evidence;
  };