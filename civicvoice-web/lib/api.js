const BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';
export const token = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
export const officerToken = () => (typeof window !== 'undefined' ? localStorage.getItem('officerToken') : null);
export const fileUrl = (p) => (p && p.startsWith('http')) ? p : `${BASE}/uploads/${p}`;

export async function api(path, { method = 'GET', body, auth, officer, form } = {}) {
  const headers = {};
  if (!form) headers['Content-Type'] = 'application/json';
  const t = officer ? officerToken() : token();
  if (auth && t) headers['Authorization'] = 'Bearer ' + t;
  const res = await fetch(BASE + path, {
    method, headers, body: form ? body : (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}