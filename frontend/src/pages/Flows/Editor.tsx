import React, { useState } from 'react';
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
    mutationFn: async (data: { nodes: any[], edges: any[] }) => {
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

  const handleSave = (nodes: any[], edges: any[]) => {
    saveMutation.mutate({ nodes, edges });
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
      <div className="flex justify-between items-center bg-gray-900 p-4 border-b border-gray-800 text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flows')} className="text-gray-400 hover:text-white">
            ← Back to Flows
          </button>
          <h1 className="text-lg font-semibold">{isNew ? 'New Flow' : flow?.name || 'Untitled Flow'}</h1>
        </div>
        {saveMutation.isPending && <span className="text-sm text-gray-400">Saving...</span>}
      </div>
      <div className="flex-1 relative">
        <FlowEditor 
          initialData={flow ? { nodes: flow.nodes, edges: flow.edges } : undefined} 
          onSaveFlow={handleSave} 
          onRunFlow={handleRun} 
        />
      </div>
    </div>
  );
};

export default FlowEditorPage;
