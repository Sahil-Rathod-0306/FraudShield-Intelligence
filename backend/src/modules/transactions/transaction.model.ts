import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    customerId: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    merchant: {
      type: String,
      trim: true,
    },

    deviceId: {
      type: String,
      index: true,
    },

    ipAddress: {
      type: String,
      index: true,
    },

    location: {
      city: String,
      state: String,
      country: String,
    },
    

    transactionType: {
      type: String,
      enum: [
        "PAYMENT",
        "TRANSFER",
        "WITHDRAWAL",
        "DEPOSIT",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "DECLINED",
        "FLAGGED",
      ],
      default: "PENDING",
    },

    transactionTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = model(
  "Transaction",
  transactionSchema
);

 

export default Transaction;