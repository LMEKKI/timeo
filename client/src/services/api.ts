import type { Job } from "shared"

const API_BASE = "/api"

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("session_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchJobs(): Promise<Job[]> {
  const res = await fetch(`${API_BASE}/jobs`, { headers: getHeaders() })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

export async function fetchJob(id: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}`, { headers: getHeaders() })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

export async function transitionJob(id: string, status: string, reason?: string): Promise<Job> {
  const res = await fetch(`${API_BASE}/jobs/${id}/transition`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ status, reason }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}
