const tokenStorageKey = "portfolio-cms-access-token";

let accessToken: string | null = null;

function readStoredToken() {
  try {
    return window.localStorage.getItem(tokenStorageKey);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) {
      window.localStorage.setItem(tokenStorageKey, token);
    } else {
      window.localStorage.removeItem(tokenStorageKey);
    }
  } catch {
    // Auth still works for the current tab if storage is unavailable.
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  writeStoredToken(token);
}

export function getAccessToken() {
  accessToken ??= readStoredToken();
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
  writeStoredToken(null);
}
