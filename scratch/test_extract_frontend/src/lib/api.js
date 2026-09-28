const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const defaultProductionUrl = 'https://raj-ms.onrender.com';
const resolvedBaseUrl = rawBaseUrl || (import.meta.env.PROD ? defaultProductionUrl : '');
export const API = resolvedBaseUrl.endsWith('/api') ? resolvedBaseUrl : (resolvedBaseUrl ? `${resolvedBaseUrl}/api` : '/api');

export function resolveApiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = API.replace(/\/api$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

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
      const url = forceRefresh ? `${API}/content?_r=${Date.now()}` : `${API}/content`;
      const response = await fetch(url);
      const payload = await readPayload(response);
      if (!response.ok) throw new Error(payload?.error || 'Could not load website content.');
      cachedContent = payload;
      return payload;
    } catch (err) {
      if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
        throw new Error('Unable to connect to the server. Please check your connection or try again.');
      }
      throw err;
    } finally {
      contentInFlightPromise = null;
    }
  })();

  return contentInFlightPromise;
}

export function clearContentCache() {
  cachedContent = null;
  contentInFlightPromise = null;
  try {
    localStorage.setItem('raja_content_updated', Date.now().toString());
    window.dispatchEvent(new Event('raja-content-updated'));
  } catch (_e) {
    // Ignore storage quota errors if any
  }
}

export async function request(path, method = 'GET', body) {
  const token = localStorage.getItem('raja_admin_token');
  try {
    const response = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    if (response.status === 401) {
      throw new Error('Your admin session has expired. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('You do not have permission to access this resource.');
    }
    if (response.status === 404) {
      throw new Error('The requested resource was not found.');
    }
    if (response.status >= 500) {
      throw new Error('Server error while processing request. Please try again.');
    }
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
  } catch (err) {
    if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('fetch'))) {
      throw new Error('Unable to connect to the server. Please check your connection or try again.');
    }
    throw err;
  }
}
