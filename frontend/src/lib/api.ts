export const fetchWorkflows = async (params?: { status?: string, take?: number }, token?: string) => {
  const search = new URLSearchParams(params as any).toString();
  const res = await fetch(`/api/v1/workflows?${search}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export const createWorkflow = async (data: any, token: string) => {
  const res = await fetch('/api/v1/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create workflow');
  return res.json();
};

export const fetchFlows = async (token: string) => {
  const res = await fetch('/api/v1/flows', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch flows');
  return res.json();
};

export const fetchFlow = async (id: string, token: string) => {
  const res = await fetch(`/api/v1/flows/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch flow');
  return res.json();
};

export const saveFlow = async (flow: any, token: string) => {
  const method = flow.id ? 'PUT' : 'POST';
  const url = flow.id ? `/api/v1/flows/${flow.id}` : '/api/v1/flows';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(flow)
  });
  if (!res.ok) throw new Error('Failed to save flow');
  return res.json();
};

export const runFlow = async (id: string, token: string) => {
  const res = await fetch(`/api/v1/flows/${id}/run`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to run flow');
  return res.json();
};

export const fetchAgentTemplates = async (token: string) => {
  const res = await fetch('/api/v1/agents/templates', { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch agent templates');
  return res.json();
};
