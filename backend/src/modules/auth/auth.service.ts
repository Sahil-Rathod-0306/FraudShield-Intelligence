import jwt
  from "jsonwebtoken";

import type {
  UserRole,
} from "../users/user.model.js";


// =====================================================
// JWT PAYLOAD
// =====================================================

export interface JwtPayload {

  userId: string;

  email: string;

  role: UserRole;
}


// =====================================================
// GENERATE JWT
// =====================================================

export function generateToken(
  payload: JwtPayload
) {

  const secret =
    process.env.JWT_SECRET;


  if (!secret) {

    throw new Error(
      "JWT_SECRET is not configured"
    );
  }


  const expiresIn =
    (
      process.env.JWT_EXPIRES_IN ||
      "1d"
    ) as NonNullable<jwt.SignOptions["expiresIn"]>;


  return jwt.sign(
    payload,
    secret,
    {
      expiresIn,
    }
  );
}


// =====================================================
// VERIFY JWT
// =====================================================

export function verifyToken(
  token: string
) {

  const secret =
    process.env.JWT_SECRET;


  if (!secret) {

    throw new Error(
      "JWT_SECRET is not configured"
    );
  }


  return jwt.verify(
    token,
    secret
  ) as JwtPayload;
}