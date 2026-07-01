import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { FlowEditor } from '../../components/FlowEditor';
import { fetchFlow, saveFlow, runFlow } from '../../lib/api.ts';

export const FlowEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const isNew = !id || id === 'new';

  const { data: flow, isLoading } = useQuery({
    queryKey: ['flow', id],
    queryFn: async () => {
      if (isNew) return null;
      const token = await getToken();
      return fetchFlow(id, token || '');
    },
    enabled: !isNew
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { nodes: any[], edges: any[], name: string }) => {
      const token = await getToken();
      return saveFlow({ id: isNew ? undefined : id, ...data }, token || '');
    },
    onSuccess: (savedFlow) => {
      alert('Flow saved successfully!');
      if (isNew) {
        navigate(`/flows/${savedFlow.id}`);
      }
    },
    onError: (err) => {
      console.error(err);
      alert('Failed to save flow');
    }
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      if (isNew) throw new Error('Save flow before running');
      const token = await getToken();
      return runFlow(id, token || '');
    },
    onSuccess: (data) => {
      alert(`Workflow queued: ${data.workflowId}`);
      // optionally navigate to /dashboard or run logs
    },
    onError: (err) => {
      console.error(err);
      alert(err.message || 'Failed to run flow');
    }
  });

  const handleSave = (nodes: any[], edges: any[], name: string) => {
    saveMutation.mutate({ nodes, edges, name });
  };

  const handleRun = () => {
    if (isNew) {
      alert('Please save the flow first before running.');
      return;
    }
    runMutation.mutate();
  };

  if (!isNew && isLoading) return <div className="p-8 text-white">Loading flow...</div>;

  return (
    <div className="h-screen w-full flex flex-col">
      <FlowEditor 
        initialData={flow ? { nodes: flow.nodes, edges: flow.edges } : undefined} 
        onSaveFlow={handleSave} 
        onRunFlow={handleRun} 
      />
    </div>
  );
};

export default FlowEditorPage;
