import {
  Router,
} from "express";

import {
  forgotPassword,
  getCurrentUser,
  login,
  register,
  resendVerification,
  resetPassword,
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
// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
  "/forgot-password",
  forgotPassword
);


// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
  "/reset-password",
  resetPassword
);

export default router;