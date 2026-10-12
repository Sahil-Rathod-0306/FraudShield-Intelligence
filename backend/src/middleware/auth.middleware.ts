import type {
  NextFunction,
  Request,
  Response,
} from "express";

import User
  from "../modules/users/user.model.js";

import {
  verifyToken,
} from "../modules/auth/auth.service.js";

import type {
  UserRole,
} from "../modules/users/user.model.js";


// =====================================================
// AUTH USER
// =====================================================

export interface AuthUser {

  id: string;

  name: string;

  email: string;

  role: UserRole;
}


// =====================================================
// AUTH REQUEST
// =====================================================

export interface AuthenticatedRequest
  extends Request {

  user?: AuthUser;
}


// =====================================================
// AUTHENTICATE
// =====================================================

export const authenticate =
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const authorization =
        req.headers.authorization;


      if (
        !authorization ||
        !authorization.startsWith(
          "Bearer "
        )
      ) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Authentication required",

          });
      }


      const token =
        authorization
          .slice(7)
          .trim();


      if (!token) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "Authentication token missing",

          });
      }


      const payload =
        verifyToken(
          token
        );


      const user =
        await User
          .findById(
            payload.userId
          )
          .select(
            "_id name email role status isEmailVerified"
          );


      if (!user) {

        return res
          .status(401)
          .json({

            success: false,

            message:
              "User no longer exists",

          });
      }


      if (
        user.status !==
        "ACTIVE"
      ) {

        return res
          .status(403)
          .json({

            success: false,

            message:
              "User account is suspended",

          });
      }


      if (
        !user.isEmailVerified
      ) {

        return res
          .status(403)
          .json({

            success: false,

            message:
              "Email verification required",

          });
      }


      req.user = {

        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

      };


      next();


    } catch (
      error
    ) {

      console.error(
        "Authentication error:",
        error
      );


      return res
        .status(401)
        .json({

          success: false,

          message:
            "Invalid or expired authentication token",

        });
    }
  };