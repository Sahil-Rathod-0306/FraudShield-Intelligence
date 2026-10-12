import crypto
  from "crypto";


// =====================================================
// GENERATE SECURE TOKEN
// =====================================================

export function generateSecureToken() {

  return crypto
    .randomBytes(32)
    .toString("hex");
}


// =====================================================
// HASH TOKEN
// =====================================================

export function hashToken(
  token: string
) {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}


// =====================================================
// VERIFICATION EXPIRY
// =====================================================

export function getVerificationExpiry() {

  const minutes =
    Number(
      process.env
        .EMAIL_VERIFICATION_EXPIRES_MINUTES
    ) || 30;


  return new Date(
    Date.now() +
    minutes *
      60 *
      1000
  );
}