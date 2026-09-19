const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API = apiBaseUrl ? `${apiBaseUrl}/api` : '/api';

let cachedContent = null;
let contentInFlightPromise = null;

async function readPayload(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('The API returned an invalid response. Make sure the backend server is running.');
  }
}

export async function getContent(forceRefresh = false) {
  if (!forceRefresh && cachedContent) {
    return cachedContent;
  }

  if (!forceRefresh && contentInFlightPromise) {
    return contentInFlightPromise;
  }

  contentInFlightPromise = (async () => {
    try {
      const response = await fetch(`${API}/content`);
      const payload = await readPayload(response);
      if (!response.ok) throw new Error(payload?.error || 'Could not load website content.');
      cachedContent = payload;
      return payload;
    } finally {
      contentInFlightPromise = null;
    }
  })();

  return contentInFlightPromise;
}

export function clearContentCache() {
  cachedContent = null;
  contentInFlightPromise = null;
}

export async function request(path, method = 'GET', body) {
  const token = localStorage.getItem('raja_admin_token');
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (response.status === 204) {
    if (['PUT', 'POST', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      clearContentCache();
    }
    return null;
  }
  const payload = await readPayload(response);
  if (!response.ok) throw new Error(payload?.error || 'Request failed.');
  if (['PUT', 'POST', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
    clearContentCache();
  }
  return payload;
}
