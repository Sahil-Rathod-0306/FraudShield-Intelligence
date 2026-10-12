import { Schema, model } from "mongoose";

const riskAssessmentSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },

    ruleRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    behaviorRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    mlRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    graphRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    finalRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
      required: true,
    },

    reasons: [
      {
        type: String,
      },
    ],

    behaviorReasons: [
      {
        type: String,
      },
    ],

    behaviorSignals: {

      historyCount: {
        type: Number,
        default: 0,
      },

      averageAmount: {
        type: Number,
        default: null,
      },

      amountRatio: {
        type: Number,
        default: null,
      },

      isNewDevice: {
        type: Boolean,
        default: null,
      },

      isNewLocation: {
        type: Boolean,
        default: null,
      },

      unusualHour: {
        type: Boolean,
        default: null,
      },

      recent10MinCount: {
        type: Number,
        default: 0,
      },
    },

    modelVersion: {
      type: String,
      default: "rule-engine-v1",
    },
  },
  {
    timestamps: true,
  }
);

const RiskAssessment = model(
  "RiskAssessment",
  riskAssessmentSchema
);

export default RiskAssessment;