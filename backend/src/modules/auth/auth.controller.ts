import type {
  Request,
  Response,
} from "express";

import User
  from "../users/user.model.js";

import {
  generateToken,
} from "./auth.service.js";

import {
  generateSecureToken,
  getPasswordResetExpiry,
  getVerificationExpiry,
  hashToken,
} from "./token.service.js";

import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "./email.service.js";

import type {
  AuthenticatedRequest,
} from "../../middleware/auth.middleware.js";


// =====================================================
// HELPERS
// =====================================================

function normalizeEmail(
  email: unknown
) {

  return String(
    email ?? ""
  )
    .trim()
    .toLowerCase();
}


function isValidEmail(
  email: string
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


// =====================================================
// REGISTER
// =====================================================

export const register =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        name,
        email,
        password,
      } =
        req.body;


      // =====================================================
      // REQUIRED FIELDS
      // =====================================================

      if (
        !name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Name, email and password are required",

          });
      }


      // =====================================================
      // NORMALIZE
      // =====================================================

      const normalizedName =
        String(name)
          .trim();


      const normalizedEmail =
        normalizeEmail(
          email
        );


      const normalizedPassword =
        String(password);


      // =====================================================
      // NAME VALIDATION
      // =====================================================

      if (
        normalizedName.length <
        2
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Name must contain at least 2 characters",

          });
      }


      // =====================================================
      // EMAIL VALIDATION
      // =====================================================

      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Please enter a valid email address",

          });
      }


      // =====================================================
      // PASSWORD VALIDATION
      // =====================================================

      if (
        normalizedPassword.length <
        8
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Password must contain at least 8 characters",

          });
      }


      // =====================================================
      // EXISTING USER
      // =====================================================

      const existingUser =
        await User.findOne({

          email:
            normalizedEmail,

        });


      if (
        existingUser
      ) {

        return res
          .status(409)
          .json({

            success: false,

            message:
              existingUser.isEmailVerified
                ? "An account with this email already exists"
                : "An unverified account with this email already exists. Please verify your email or resend the verification email.",

          });
      }


      // =====================================================
      // VERIFICATION TOKEN
      // =====================================================

      const verificationToken =
        generateSecureToken();


      const verificationTokenHash =
        hashToken(
          verificationToken
        );


      const verificationExpires =
        getVerificationExpiry();


      // =====================================================
      // CREATE USER
      // =====================================================

      const user =
        await User.create({

          name:
            normalizedName,

          email:
            normalizedEmail,

          password:
            normalizedPassword,

          // Public registration cannot select a role.
          role:
            "ANALYST",

          status:
            "ACTIVE",

          authProvider:
            "LOCAL",

          isEmailVerified:
            false,

          emailVerificationTokenHash:
            verificationTokenHash,

          emailVerificationTokenExpires:
            verificationExpires,

        });


      // =====================================================
      // SEND VERIFICATION EMAIL
      // =====================================================

      try {

        await sendVerificationEmail({

          email:
            user.email,

          name:
            user.name,

          token:
            verificationToken,

        });


      } catch (
        emailError
      ) {

        console.error(
          "Verification email error:",
          emailError
        );


        // Account was just created and verification
        // email could not be sent.
        // Delete it so user can register again.

        await User.findByIdAndDelete(
          user._id
        );


        return res
          .status(500)
          .json({

            success: false,

            message:
              "Unable to send verification email. Please try again.",

          });
      }


      // =====================================================
      // RESPONSE
      // =====================================================

      return res
        .status(201)
        .json({

          success: true,

          message:
            "Registration successful. Please check your email and verify your account.",

          data: {

            user: {

              id:
                user._id.toString(),

              name:
                user.name,

              email:
                user.email,

              role:
                user.role,

              status:
                user.status,

              authProvider:
                user.authProvider,

              isEmailVerified:
                user.isEmailVerified,

            },

          },

        });


    } catch (
      error
    ) {

      console.error(
        "Register error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to register user",

          error:
            error instanceof Error
              ? error.message
              : "Unknown error",

        });
    }
  };


// =====================================================
// VERIFY EMAIL
// =====================================================

export const verifyEmail =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        token,
      } =
        req.body;


      if (
        !token ||
        typeof token !==
          "string"
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Verification token is required",

          });
      }


      // =====================================================
      // HASH TOKEN
      // =====================================================

      const tokenHash =
        hashToken(
          token
        );


      // =====================================================
      // FIND USER
      // =====================================================

      const user =
        await User
          .findOne({

            emailVerificationTokenHash:
              tokenHash,

            emailVerificationTokenExpires: {

              $gt:
                new Date(),

            },

          })
          .select(
            "+emailVerificationTokenHash +emailVerificationTokenExpires"
          );


      if (
        !user
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Verification link is invalid or has expired",

          });
      }


      // =====================================================
      // VERIFY ACCOUNT
      // =====================================================

      user.isEmailVerified =
        true;


      user.emailVerificationTokenHash =
        undefined;


      user.emailVerificationTokenExpires =
        undefined;


      await user.save();


      return res
        .status(200)
        .json({

          success: true,

          message:
            "Email verified successfully. You can now sign in.",

        });


    } catch (
      error
    ) {

      console.error(
        "Verify email error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to verify email",

        });
    }
  };


// =====================================================
// RESEND VERIFICATION EMAIL
// =====================================================

export const resendVerification =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        email,
      } =
        req.body;


      if (
        !email
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Email is required",

          });
      }


      const normalizedEmail =
        normalizeEmail(
          email
        );


      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Please enter a valid email address",

          });
      }


      const user =
        await User.findOne({

          email:
            normalizedEmail,

        });


      // =====================================================
      // DON'T REVEAL ACCOUNT EXISTENCE
      // =====================================================

      if (
        !user ||
        user.isEmailVerified
      ) {

        return res
          .status(200)
          .json({

            success: true,

            message:
              "If an unverified account exists, a new verification email has been sent.",

          });
      }


      // =====================================================
      // CREATE NEW TOKEN
      // =====================================================

      const verificationToken =
        generateSecureToken();


      user.emailVerificationTokenHash =
        hashToken(
          verificationToken
        );


      user.emailVerificationTokenExpires =
        getVerificationExpiry();


      await user.save();


      // =====================================================
      // SEND EMAIL
      // =====================================================

      await sendVerificationEmail({

        email:
          user.email,

        name:
          user.name,

        token:
          verificationToken,

      });


      return res
        .status(200)
        .json({

          success: true,

          message:
            "If an unverified account exists, a new verification email has been sent.",

        });


    } catch (
      error
    ) {

      console.error(
        "Resend verification error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to resend verification email",

        });
    }
  };


// =====================================================
// LOGIN
// =====================================================

export const login =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        email,
        password,
      } =
        req.body;


      // =====================================================
      // REQUIRED FIELDS
      // =====================================================

      if (
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Email and password are required",

          });
      }


      const normalizedEmail =
        normalizeEmail(
          email
        );


      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Please enter a valid email address",

          });
      }


      // =====================================================
      // FIND USER + INCLUDE PASSWORD
      // =====================================================

      const user =
        await User
          .findOne({

            email:
              normalizedEmail,

          })
          .select(
            "+password"
          );


      // =====================================================
      // SAFE DEVELOPMENT DEBUG
      // =====================================================

      if (
        process.env.NODE_ENV !==
        "production"
      ) {

        const storedPassword =
          user?.password;

        console.log(
          "LOGIN DEBUG:",
          {

            email:
              normalizedEmail,

            userFound:
              Boolean(user),

            hasPassword:
              Boolean(
                storedPassword
              ),

            // These report only metadata: never the submitted password or
            // its stored bcrypt hash.
            passwordFieldSelected:
              Boolean(
                user &&
                Object.prototype.hasOwnProperty.call(
                  user.toObject(),
                  "password"
                )
              ),

            passwordLooksLikeBcrypt:
              Boolean(
                storedPassword &&
                /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(
                  storedPassword
                )
              ),

            verified:
              user?.isEmailVerified,

            status:
              user?.status,

            authProvider:
              user?.authProvider,

          }
        );
      }


      // =====================================================
      // USER NOT FOUND
      // =====================================================

      if (
        !user
      ) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Invalid email or password",

          });
      }


      // =====================================================
      // LOCAL PASSWORD MUST EXIST
      // =====================================================

      if (
        !user.password
      ) {

        if (
          process.env.NODE_ENV !==
          "production"
        ) {

          console.log(
            "LOGIN DEBUG: User has no local password."
          );
        }


        return res
          .status(401)
          .json({

            success: false,

            message:
              "Invalid email or password",

          });
      }


      // =====================================================
      // CHECK PASSWORD FIRST
      // =====================================================

      const passwordMatches =
        await user.comparePassword(
          String(password)
        );


      if (
        process.env.NODE_ENV !==
        "production"
      ) {

        console.log(
          "PASSWORD MATCH:",
          {
            email: normalizedEmail,
            passwordMatches,
          }
        );
      }


      if (
        !passwordMatches
      ) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Invalid email or password",

          });
      }


      // =====================================================
      // ACCOUNT STATUS
      // =====================================================

      if (
        user.status !==
        "ACTIVE"
      ) {

        return res
          .status(403)
          .json({

            success: false,

            message:
              "Your account has been suspended",

          });
      }


      // =====================================================
      // EMAIL VERIFICATION
      // =====================================================

      if (
        !user.isEmailVerified
      ) {

        return res
          .status(403)
          .json({

            success: false,

            message:
              "Please verify your email before signing in",

            code:
              "EMAIL_NOT_VERIFIED",

          });
      }


      // =====================================================
      // UPDATE LAST LOGIN
      // =====================================================

      const lastLoginAt =
        new Date();


      // Use updateOne instead of user.save().
      // This avoids running document save hooks unnecessarily.

      await User.updateOne(

        {
          _id:
            user._id,
        },

        {
          $set: {
            lastLoginAt,
          },
        }

      );


      // =====================================================
      // GENERATE JWT
      // =====================================================

      const jwtToken =
        generateToken({

          userId:
            user._id.toString(),

          email:
            user.email,

          role:
            user.role,

        });


      // =====================================================
      // SUCCESS
      // =====================================================

      return res
        .status(200)
        .json({

          success: true,

          message:
            "Login successful",

          data: {

            token:
              jwtToken,

            user: {

              id:
                user._id.toString(),

              name:
                user.name,

              email:
                user.email,

              role:
                user.role,

              status:
                user.status,

              authProvider:
                user.authProvider,

              isEmailVerified:
                user.isEmailVerified,

              lastLoginAt,

            },

          },

        });


    } catch (
      error
    ) {

      console.error(
        "Login error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to login",

          error:
            process.env.NODE_ENV ===
            "development"
              ? (
                  error instanceof Error
                    ? error.message
                    : "Unknown error"
                )
              : undefined,

        });
    }
  };





// =====================================================
// RESET PASSWORD
// =====================================================

export const resetPassword =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        token,
        password,
      } =
        req.body;


      // =====================================================
      // VALIDATION
      // =====================================================

      if (
        !token ||
        typeof token !==
          "string"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Password reset token is required",

          });
      }


      if (
        !password ||
        typeof password !==
          "string"
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "New password is required",

          });
      }


      if (
        password.length <
        8
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Password must contain at least 8 characters",

          });
      }


      // =====================================================
      // HASH INCOMING TOKEN
      // =====================================================

      const resetTokenHash =
        hashToken(
          token
        );


      // =====================================================
      // FIND USER
      // =====================================================

      const user =
        await User
          .findOne({

            passwordResetTokenHash:
              resetTokenHash,

            passwordResetTokenExpires: {

              $gt:
                new Date(),

            },

          })
          .select(
            "+passwordResetTokenHash +passwordResetTokenExpires +password"
          );


      if (
        !user
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Password reset link is invalid or has expired",

          });
      }


      // =====================================================
      // SET NEW PASSWORD
      // =====================================================

      user.password =
        password;


      user.passwordResetTokenHash =
        undefined;


      user.passwordResetTokenExpires =
        undefined;


      // If this account previously supported Google + local,
      // keep LOCAL_GOOGLE.
      //
      // Otherwise ensure this is a local account.

      if (
        user.authProvider !==
        "LOCAL_GOOGLE"
      ) {

        user.authProvider =
          "LOCAL";
      }


      await user.save();


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Password reset successfully. You can now sign in with your new password.",

        });


    } catch (
      error
    ) {

      console.error(
        "Reset password error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to reset password",

        });
    }
  };
  // =====================================================
// FORGOT PASSWORD
// =====================================================

export const forgotPassword =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        email,
      } =
        req.body;


      if (
        !email
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Email is required",

          });
      }


      const normalizedEmail =
        normalizeEmail(
          email
        );


      if (
        !isValidEmail(
          normalizedEmail
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Please enter a valid email address",

          });
      }


      // =====================================================
      // FIND USER
      // =====================================================

      const user =
        await User.findOne({

          email:
            normalizedEmail,

        });


      // =====================================================
      // GENERIC RESPONSE
      // =====================================================
      //
      // Do not reveal whether the email exists.
      // =====================================================

      if (
        !user
      ) {

        return res
          .status(200)
          .json({

            success:
              true,

            message:
              "If an account exists with this email, a password reset link has been sent.",

          });
      }


      // =====================================================
      // GOOGLE-ONLY ACCOUNT
      // =====================================================

      if (
        user.authProvider ===
        "GOOGLE"
      ) {

        return res
          .status(200)
          .json({

            success:
              true,

            message:
              "If an account exists with this email, a password reset link has been sent.",

          });
      }


      // =====================================================
      // GENERATE RESET TOKEN
      // =====================================================

      const resetToken =
        generateSecureToken();


      const resetTokenHash =
        hashToken(
          resetToken
        );


      user.passwordResetTokenHash =
        resetTokenHash;


      user.passwordResetTokenExpires =
        getPasswordResetExpiry();


      await user.save();


      // =====================================================
      // SEND EMAIL
      // =====================================================

      await sendPasswordResetEmail({

        email:
          user.email,

        name:
          user.name,

        token:
          resetToken,

      });


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "If an account exists with this email, a password reset link has been sent.",

        });


    } catch (
      error
    ) {

      console.error(
        "Forgot password error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to process password reset request",

        });
    }
  };
// =====================================================
// GET CURRENT USER
// =====================================================

export const getCurrentUser =
  async (
    req:
      AuthenticatedRequest,

    res:
      Response
  ) => {

    try {

      if (
        !req.user
      ) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Authentication required",

          });
      }


      return res
        .status(200)
        .json({

          success: true,

          message:
            "Current user fetched successfully",

          data: {

            user:
              req.user,

          },

        });


    } catch (
      error
    ) {

      console.error(
        "Current user error:",
        error
      );


      return res
        .status(500)
        .json({

          success: false,

          message:
            "Failed to get current user",

        });
    }
  };
