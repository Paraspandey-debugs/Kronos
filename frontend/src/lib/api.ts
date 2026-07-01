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
