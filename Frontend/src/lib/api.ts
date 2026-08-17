const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  incidents: {
    list: (params?: { status?: string; priority?: string; type?: string; limit?: number; offset?: number }) =>
      request<any[]>(`/api/incidents?${new URLSearchParams(params as any).toString()}`),
    get: (id: number) => request<any>(`/api/incidents/${id}`),
    create: (data: any) => request<any>('/api/incidents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/api/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/incidents/${id}`, { method: 'DELETE' }),
    summary: (id: number) => request<any>(`/api/incidents/${id}/summary`, { method: 'POST' }),
    sos: (data: any) => request<any>('/api/sos', { method: 'POST', body: JSON.stringify(data) }),
  },

  zones: {
    list: (params?: { type?: string; active_only?: boolean; limit?: number; offset?: number }) =>
      request<any[]>(`/api/zones?${new URLSearchParams(params as any).toString()}`),
    get: (id: number) => request<any>(`/api/zones/${id}`),
    create: (data: any) => request<any>('/api/zones', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/api/zones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/zones/${id}`, { method: 'DELETE' }),
    predictions: (zoneId: number) => request<any[]>(`/api/zones/${zoneId}/predictions`),
    predictiveRisk: (data: any) => request<any>('/api/predictive-risk', { method: 'POST', body: JSON.stringify(data) }),
  },

  resources: {
    list: (params?: { type?: string; status?: string; limit?: number; offset?: number }) =>
      request<any[]>(`/api/resources?${new URLSearchParams(params as any).toString()}`),
    get: (id: number) => request<any>(`/api/resources/${id}`),
    create: (data: any) => request<any>('/api/resources', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/api/resources/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deploy: (resourceId: number, incidentId: number) =>
      request<any>(`/api/resources/${resourceId}/deploy/${incidentId}`, { method: 'POST' }),
    return: (resourceId: number) =>
      request<any>(`/api/resources/${resourceId}/return`, { method: 'POST' }),
  },

  stats: () => request<any>('/api/stats'),
  summary: (data: any) => request<any>('/api/summary', { method: 'POST', body: JSON.stringify(data) }),
};

export default api;