import {
  Schema,
  model,
} from "mongoose";

const fraudCaseSchema =
  new Schema(
    {
      caseId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      transactionId: {
        type:
          Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
        index: true,
      },

      customerId: {
        type: String,
        required: true,
        index: true,
      },

      riskAssessmentId: {
        type:
          Schema.Types.ObjectId,
        ref: "RiskAssessment",
        required: true,
      },

      riskScore: {
        type: Number,
        required: true,
      },

      severity: {
        type: String,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ],
        required: true,
      },

      status: {
        type: String,
        enum: [
          "OPEN",
          "INVESTIGATING",
          "ESCALATED",
          "CONFIRMED_FRAUD",
          "FALSE_POSITIVE",
          "CLOSED",
        ],
        default: "OPEN",
      },

      title: {
        type: String,
        required: true,
      },

      description: {
        type: String,
      },

      evidence: [
        {
          type: String,
        },
      ],

      assignedTo: {
        type:
          Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      resolution: {
        type: String,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

const FraudCase =
  model(
    "FraudCase",
    fraudCaseSchema
  );

export default FraudCase;