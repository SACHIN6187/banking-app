const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await res.json()
    : null;

  if (!res.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

export async function loginApi(email: string, password: string) {
  return apiFetch("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function sendRegisterOtpApi( email: string,name: string , password:string) {
  return apiFetch("/auth/register/otp", {
    method: "POST",
    body: JSON.stringify({ email,name,password }),
  });
}

// SECURITY FIX: Now send name, password, and OTP during verification
export async function verifyRegisterOtpApi(email: string, otp: string, name: string, password: string) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, otp, name, password }),
  });
}

// ─── Account ─────────────────────────────────────────────────────
export async function getAccountApi(token: string) {
  return apiFetch("/Info", { method: "GET" }, token);
}

export async function checkSystemUserApi(token: string) {
  return apiFetch("/check", { method: "GET" }, token);
}

export async function createAccountApi(token: string) {
  return apiFetch("/accounts", { method: "POST" }, token);
}

export async function getTransactionsApi(token: string) {
  return apiFetch("/transactions", { method: "GET" }, token);
}

export async function generateFundApi(
  token: string,
  toAccount: string,
  amount: number
) {
  return apiFetch(
    "/transactions/intial-fund",
    {
      method: "POST",
      body: JSON.stringify({
        toAccount,
        amount,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }),
    },
    token
  );
}

export async function sendMoneyApi(
  token: string,
  fromAccount: string,
  toAccount: string,
  amount: number,
) {
  return apiFetch(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }),
    },
    token
  );
}
