import {
  getAuthToken,
  removeAuthToken,
} from "./auth";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";


// =====================================================
// API REQUEST
// =====================================================

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token =
    getAuthToken();


  const headers =
    new Headers(
      options.headers
    );


  if (
    !headers.has(
      "Content-Type"
    )
  ) {

    headers.set(
      "Content-Type",
      "application/json"
    );
  }


  if (token) {

    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers,

        cache:
          "no-store",
      }
    );


  let data: any;


  try {

    data =
      await response.json();

  } catch {

    throw new Error(
      `Invalid response from backend (${response.status})`
    );
  }


  // =====================================================
  // EXPIRED / INVALID JWT
  // =====================================================

  if (
    response.status ===
      401 &&
    token
  ) {

    removeAuthToken();


    if (
      typeof window !==
      "undefined"
    ) {

      window.location.href =
        "/login";
    }
  }


  if (
    !response.ok
  ) {

    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }


  return data as T;
}