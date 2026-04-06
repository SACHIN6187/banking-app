import Cookies from "js-cookie";

const TOKEN_KEY = "vault_token";
const USER_KEY = "vault_user";

export function saveAuth(token: string, user: object) {
  Cookies.set(TOKEN_KEY, token, { expires: 3, sameSite: "strict" }); // 3 days
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 3, sameSite: "strict" });
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getUser() {
  try {
    const u = Cookies.get(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}
