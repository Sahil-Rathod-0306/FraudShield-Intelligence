interface FusionInput {
  ruleRisk: number;
  behaviorRisk: number;
  mlRisk: number;
  hasBehaviorHistory: boolean;
  mlAvailable: boolean;
}

export interface FinalRiskResult {
  finalRisk: number;

  riskLevel:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";
}

const getRiskLevel = (
  score: number
): FinalRiskResult["riskLevel"] => {

  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 30) {
    return "MEDIUM";
  }

  return "LOW";
};


export const calculateFinalRisk = (
  input: FusionInput
): FinalRiskResult => {

  let finalRisk = 0;

  // --------------------------------
  // CASE 1
  // Rule only
  // --------------------------------

  if (
    !input.hasBehaviorHistory &&
    !input.mlAvailable
  ) {

    finalRisk =
      input.ruleRisk;
  }

  // --------------------------------
  // CASE 2
  // Rules + ML
  // --------------------------------

  else if (
    !input.hasBehaviorHistory &&
    input.mlAvailable
  ) {

    finalRisk =
      input.ruleRisk * 0.40 +
      input.mlRisk * 0.60;
  }

  // --------------------------------
  // CASE 3
  // Rules + Behaviour
  // --------------------------------

  else if (
    input.hasBehaviorHistory &&
    !input.mlAvailable
  ) {

    finalRisk =
      input.ruleRisk * 0.45 +
      input.behaviorRisk * 0.55;
  }

  // --------------------------------
  // CASE 4
  // Rules + Behaviour + ML
  // --------------------------------

  else {

    finalRisk =
      input.ruleRisk * 0.25 +
      input.behaviorRisk * 0.40 +
      input.mlRisk * 0.35;
  }


  // A strong rule alert should not
  // become lower after fusion
  finalRisk = Math.max(
    input.ruleRisk,
    finalRisk
  );


  finalRisk = Math.round(
    Math.min(
      finalRisk,
      100
    )
  );


  return {

    finalRisk,

    riskLevel:
      getRiskLevel(
        finalRisk
      ),
  };
};