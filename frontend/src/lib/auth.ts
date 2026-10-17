// =====================================================
// TOKEN KEY
// =====================================================

const TOKEN_KEY =
  "fraudshield_token";


// =====================================================
// SAVE TOKEN
// =====================================================

export function saveAuthToken(
  token: string
) {

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}


// =====================================================
// GET TOKEN
// =====================================================

export function getAuthToken() {

  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }


  return localStorage.getItem(
    TOKEN_KEY
  );
}


// =====================================================
// REMOVE TOKEN
// =====================================================

export function removeAuthToken() {

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }


  localStorage.removeItem(
    TOKEN_KEY
  );
}


// =====================================================
// AUTH CHECK
// =====================================================

export function hasAuthToken() {

  return Boolean(
    getAuthToken()
  );
}