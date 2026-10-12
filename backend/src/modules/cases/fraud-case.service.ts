import FraudCase from "./fraud-case.model.js";

interface CreateFraudCaseInput {
  transactionId: string;
  customerId: string;
  riskAssessmentId: string;

  riskScore: number;

  riskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  reasons: string[];
}


export const createFraudCase =
  async (
    input: CreateFraudCaseInput
  ) => {

    const caseId =
      `CASE-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;


    const fraudCase =
      await FraudCase.create({

        caseId,

        transactionId:
          input.transactionId,

        customerId:
          input.customerId,

        riskAssessmentId:
          input.riskAssessmentId,

        riskScore:
          input.riskScore,

        severity:
          input.riskLevel,

        status: "OPEN",

        title:
          `${input.riskLevel} risk transaction detected`,

        description:
          `FraudShield automatically created this case because the transaction received a risk score of ${input.riskScore}.`,

        evidence:
          input.reasons,
      });


    return fraudCase;
  };