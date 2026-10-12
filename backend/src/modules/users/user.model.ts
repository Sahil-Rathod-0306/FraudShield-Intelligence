import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

import bcrypt
  from "bcryptjs";


// =====================================================
// TYPES
// =====================================================

export type UserRole =
  | "ADMIN"
  | "ANALYST"
  | "INVESTIGATOR";


export type UserStatus =
  | "ACTIVE"
  | "SUSPENDED";


export type AuthProvider =
  | "LOCAL"
  | "GOOGLE"
  | "LOCAL_GOOGLE";


// =====================================================
// USER INTERFACE
// =====================================================

export interface IUser
  extends Document {

  name: string;

  email: string;

  password?: string | undefined;

  role: UserRole;

  status: UserStatus;

  authProvider: AuthProvider;

  googleId?: string | undefined;

  isEmailVerified: boolean;

  emailVerificationTokenHash?: string | undefined;

  emailVerificationTokenExpires?: Date | undefined;

  passwordResetTokenHash?: string | undefined;

  passwordResetTokenExpires?: Date | undefined;

  lastLoginAt?: Date | undefined;

  createdAt: Date;

  updatedAt: Date;


  comparePassword(
    candidatePassword: string
  ): Promise<boolean>;
}


// =====================================================
// SCHEMA
// =====================================================

const userSchema =
  new Schema<IUser>(
    {

      name: {

        type: String,

        required: true,

        trim: true,

        minlength: 2,

        maxlength: 100,
      },


      email: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true,

        index: true,
      },


      password: {

        type: String,

        minlength: 8,

        select: false,
      },


      role: {

        type: String,

        enum: [
          "ADMIN",
          "ANALYST",
          "INVESTIGATOR",
        ],

        default: "ANALYST",

        index: true,
      },


      status: {

        type: String,

        enum: [
          "ACTIVE",
          "SUSPENDED",
        ],

        default: "ACTIVE",

        index: true,
      },


      authProvider: {

        type: String,

        enum: [
          "LOCAL",
          "GOOGLE",
          "LOCAL_GOOGLE",
        ],

        default: "LOCAL",
      },


      googleId: {

        type: String,

        unique: true,

        sparse: true,

        index: true,
      },


      isEmailVerified: {

        type: Boolean,

        default: false,

        index: true,
      },


      emailVerificationTokenHash: {

        type: String,

        select: false,
      },


      emailVerificationTokenExpires: {

        type: Date,

        select: false,
      },


      passwordResetTokenHash: {

        type: String,

        select: false,
      },


      passwordResetTokenExpires: {

        type: Date,

        select: false,
      },


      lastLoginAt: {

        type: Date,

        default: null,
      },

    },

    {

      timestamps: true,

    }
  );


// =====================================================
// HASH PASSWORD
// =====================================================

userSchema.pre(
  "save",
  async function () {

    if (
      !this.isModified("password")
    ) {
      return;
    }


    if (!this.password) {
      return;
    }


    const salt =
      await bcrypt.genSalt(
        12
      );


    this.password =
      await bcrypt.hash(
        this.password,
        salt
      );
  }
);


// =====================================================
// COMPARE PASSWORD
// =====================================================

userSchema.methods.comparePassword =
  async function (
    candidatePassword: string
  ) {

    if (!this.password) {
      return false;
    }


    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };


// =====================================================
// MODEL
// =====================================================

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>(
    "User",
    userSchema
  );


export default User;