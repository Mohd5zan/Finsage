
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface ApiErrorResponse {
  error?: string;
}

async function readError(
  response: Response,
  fallback: string
): Promise<Error> {
  try {
    const result = (await response.json()) as ApiErrorResponse;
    return new Error(result.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw await readError(response, "Registration failed");
  }

  const result = await response.json();
  return result.data as AuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw await readError(response, "Login failed");
  }

  const result = await response.json();
  const loginResult = result.data as LoginResponse;

  if (
    !loginResult?.accessToken ||
    !loginResult.user?.id ||
    !loginResult.user?.name
  ) {
    throw new Error("The server returned an invalid login response.");
  }

  return loginResult;
}

export async function logout(accessToken: string): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Local logout should still work when the server is unreachable.
  }
}
