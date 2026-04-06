const BASE_URL = "http://localhost:3000/api";

// ─── Generic fetch helper ────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────
export async function loginApi(email: string, password: string) {
  return apiFetch("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(name: string, email: string, password: string) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── Account ─────────────────────────────────────────────────────
export async function getAccountApi(token: string) {
  return apiFetch("/Info", { method: "GET" }, token);
}

export async function createAccountApi(token: string) {
  return apiFetch("/accounts", { method: "POST" }, token);
}

// ─── Transactions ────────────────────────────────────────────────
export async function getTransactionsApi(token: string) {
  return apiFetch("/transactions", { method: "GET" }, token);
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
        idempotencyKey: crypto.randomUUID(),
      }),
    },
    token
  );
}
