import {
  Schema,
  model,
} from "mongoose";


const fraudEvidenceSchema =
  new Schema(
    {
      transactionId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Transaction",

        required:
          true,

        index:
          true,
      },


      riskAssessmentId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "RiskAssessment",

        required:
          true,
      },


      fraudCaseId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "FraudCase",

        default:
          null,
      },


      customerId: {
        type:
          String,

        required:
          true,

        index:
          true,
      },


      ruleEvidence: [
        {
          type:
            String,
        },
      ],


      behaviorEvidence: [
        {
          type:
            String,
        },
      ],


      mlEvidence: [
        {
          feature: {
            type:
              String,

            required:
              true,
          },

          value: {
            type:
              Number,
          },

          contribution: {
            type:
              Number,

            required:
              true,
          },
        },
      ],


      mlPrediction: {
        type:
          String,

        enum: [
          "FRAUD",
          "LEGITIMATE",
          "UNAVAILABLE",
        ],

        default:
          "UNAVAILABLE",
      },


      mlProbability: {
        type:
          Number,

        min:
          0,

        max:
          1,

        default:
          0,
      },


      ruleRisk: {
        type:
          Number,

        default:
          0,
      },


      behaviorRisk: {
        type:
          Number,

        default:
          0,
      },


      mlRisk: {
        type:
          Number,

        default:
          0,
      },


      finalRisk: {
        type:
          Number,

        required:
          true,
      },


      riskLevel: {
        type:
          String,

        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ],

        required:
          true,
      },
    },
    {
      timestamps:
        true,
    }
  );


const FraudEvidence =
  model(
    "FraudEvidence",
    fraudEvidenceSchema
  );


export default FraudEvidence;