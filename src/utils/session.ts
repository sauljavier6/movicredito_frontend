const TOKEN_KEY = "movicredito_token";
const USER_KEY = "movicredito_user";

export function clearMoviCreditoSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getMoviCreditoToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getJwtExpirationMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload?.exp || typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, clockSkewMs = 5000) {
  const expiration = getJwtExpirationMs(token);
  if (!expiration) return true;
  return expiration <= Date.now() + clockSkewMs;
}

export function expireMoviCreditoSession() {
  clearMoviCreditoSession();
  const loginUrl = "/login?reason=session-expired";
  if (window.location.pathname !== "/login") window.location.replace(loginUrl);
}

let fetchInterceptorInstalled = false;

function getAuthorizationHeader(input: RequestInfo | URL, init?: RequestInit) {
  const initHeaders = new Headers(init?.headers || {});
  const fromInit = initHeaders.get("Authorization");
  if (fromInit) return fromInit;
  if (input instanceof Request) return input.headers.get("Authorization");
  return null;
}

export function installAuthFetchInterceptor() {
  if (fetchInterceptorInstalled) return;
  fetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const authorization = getAuthorizationHeader(input, init);
    const response = await originalFetch(input, init);

    if (response.status === 401 && authorization?.startsWith("Bearer ")) {
      const sentToken = authorization.slice("Bearer ".length).trim();
      const currentToken = getMoviCreditoToken();
      if (currentToken && sentToken === currentToken) expireMoviCreditoSession();
    }

    return response;
  };
}
