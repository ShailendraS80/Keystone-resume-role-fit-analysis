const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token = localStorage.getItem("keystone_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export function signup(email, password) {
  return request("/auth/signup", { method: "POST", body: { email, password } });
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: { email, password } });
}

export function analyzeMatch(resumeText, jdText, jobTitle) {
  return request("/match/analyze", {
    method: "POST",
    body: { resumeText, jdText, jobTitle },
    auth: true,
  });
}

export function getHistory() {
  return request("/match/history", { auth: true });
}

export async function extractPdfText(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_URL}/match/extract-pdf`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not read that PDF");
  }
  return data.text;
}
