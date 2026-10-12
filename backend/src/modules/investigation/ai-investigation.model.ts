import {
  Schema,
  model,
} from "mongoose";


const aiInvestigationSchema =
  new Schema(
    {
      caseId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "FraudCase",

        required:
          true,

        index:
          true,
      },


      transactionId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Transaction",

        required:
          true,
      },


      customerId: {
        type:
          String,

        required:
          true,

        index:
          true,
      },


      modelName: {
        type:
          String,

        required:
          true,
      },


      report: {
        type:
          String,

        required:
          true,
      },


      status: {
        type:
          String,

        enum: [
          "COMPLETED",
          "FAILED",
        ],

        default:
          "COMPLETED",
      },
    },
    {
      timestamps:
        true,
    }
  );


const AIInvestigation =
  model(
    "AIInvestigation",
    aiInvestigationSchema
  );


export default AIInvestigation;