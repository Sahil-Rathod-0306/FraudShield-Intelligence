import {
  Router,
} from "express";

import {
  getCurrentUser,
  login,
  register,
  resendVerification,
  verifyEmail,
} from "./auth.controller.js";

import {
  authenticate,
} from "../../middleware/auth.middleware.js";


const router =
  Router();


// =====================================================
// REGISTER
// =====================================================

router.post(
  "/register",
  register
);


// =====================================================
// VERIFY EMAIL
// =====================================================

router.post(
  "/verify-email",
  verifyEmail
);


// =====================================================
// RESEND VERIFICATION
// =====================================================

router.post(
  "/resend-verification",
  resendVerification
);


// =====================================================
// LOGIN
// =====================================================

router.post(
  "/login",
  login
);


// =====================================================
// CURRENT USER
// =====================================================

router.get(
  "/me",
  authenticate,
  getCurrentUser
);


export default router;