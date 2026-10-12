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
  getVerificationExpiry,
  hashToken,
} from "./token.service.js";

import {
  sendVerificationEmail,
} from "./email.service.js";

type AuthenticatedRequest = Request & {
  user?: unknown;
};


// =====================================================
// EMAIL VALIDATION
// =====================================================

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
      // REQUIRED VALUES
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
        String(email)
          .trim()
          .toLowerCase();


      const normalizedPassword =
        String(password);


      // =====================================================
      // VALIDATE NAME
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
      // VALIDATE EMAIL
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
      // VALIDATE PASSWORD
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
      // CHECK EXISTING USER
      // =====================================================

      const existingUser =
        await User.findOne({

          email:
            normalizedEmail,

        });


      if (existingUser) {

        return res
          .status(409)
          .json({

            success: false,

            message:
              "An account with this email already exists",

          });
      }


      // =====================================================
      // EMAIL VERIFICATION TOKEN
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

          // IMPORTANT:
          // Public registration can NEVER choose role.
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
      // SEND EMAIL
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


        // Remove the new user if email sending fails.
        // This allows them to register again cleanly.

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
                user._id,

              name:
                user.name,

              email:
                user.email,

              role:
                user.role,

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
      // HASH INCOMING TOKEN
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


      if (!user) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Verification link is invalid or has expired",

          });
      }


      // =====================================================
      // VERIFY
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


      if (!email) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Email is required",

          });
      }


      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();


      const user =
        await User.findOne({

          email:
            normalizedEmail,

        });


      // Avoid revealing whether an account exists.

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


      const verificationToken =
        generateSecureToken();


      user.emailVerificationTokenHash =
        hashToken(
          verificationToken
        );


      user.emailVerificationTokenExpires =
        getVerificationExpiry();


      await user.save();


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
        String(email)
          .trim()
          .toLowerCase();


      // =====================================================
      // FIND USER + PASSWORD
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


      if (!user) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Invalid email or password",

          });
      }


      // =====================================================
      // STATUS
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
      // EMAIL VERIFIED?
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
      // CHECK PASSWORD
      // =====================================================

      const matches =
        await user.comparePassword(
          String(password)
        );


      if (!matches) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Invalid email or password",

          });
      }


      // =====================================================
      // UPDATE LOGIN
      // =====================================================

      user.lastLoginAt =
        new Date();


      await user.save();


      // =====================================================
      // JWT
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
                user._id,

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

              lastLoginAt:
                user.lastLoginAt,

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

      if (!req.user) {

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