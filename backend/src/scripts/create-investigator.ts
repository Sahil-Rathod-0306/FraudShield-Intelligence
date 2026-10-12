import "dotenv/config";

import bcrypt from "bcrypt";
import mongoose from "mongoose";

import User from "../modules/users/user.model.js";
import { connectDatabase } from "../config/datebase.js";


const createInvestigator = async () => {
  try {

    // -----------------------------------
    // Connect MongoDB
    // -----------------------------------

    await connectDatabase();


    // -----------------------------------
    // Investigator details
    // -----------------------------------

    const email =
      "investigator@fraudshield.com";

    const plainPassword =
      "Investigator@123";


    // -----------------------------------
    // Check existing user
    // -----------------------------------

    const existingUser =
      await User.findOne({
        email,
      });


    if (existingUser) {

      console.log(
        "Investigator already exists."
      );

      console.log(
        "MongoDB ID:",
        existingUser._id.toString()
      );

      console.log(
        "Email:",
        existingUser.email
      );

      console.log(
        "Role:",
        existingUser.role
      );


      await mongoose.disconnect();

      process.exit(0);
    }


    // -----------------------------------
    // Hash password
    // -----------------------------------

    const hashedPassword =
      await bcrypt.hash(
        plainPassword,
        12
      );


    // -----------------------------------
    // Create investigator
    // -----------------------------------

    const investigator =
      await User.create({

        name:
          "Fraud Investigator",

        email,

        password:
          hashedPassword,

        role:
          "INVESTIGATOR",

        status:
          "ACTIVE",
      });


    console.log(
      "\n✅ Investigator created successfully"
    );


    console.log(
      "\nMongoDB ID:"
    );

    console.log(
      investigator._id.toString()
    );


    console.log(
      "\nEmail:"
    );

    console.log(email);


    console.log(
      "\nTemporary password:"
    );

    console.log(
      plainPassword
    );


    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      "❌ Failed to create investigator:",
      error
    );


    await mongoose.disconnect();

    process.exit(1);
  }
};


createInvestigator();