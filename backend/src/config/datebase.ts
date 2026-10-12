import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log(
      `🍃 MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);

    process.exit(1);
  }
};