import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchFlows } from '../../lib/api.ts';
import { Plus, Edit3, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const FlowsList: React.FC = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const { data: flows, isLoading } = useQuery({
    queryKey: ['flows'],
    queryFn: async () => {
      const token = await getToken();
      return fetchFlows(token || '');
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Visual Flows</h1>
            <p className="text-gray-400">Design and manage your directed acyclic graphs</p>
          </div>
          <button 
            onClick={() => navigate('/flows/new')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Create New Flow
          </button>
        </div>

        {isLoading ? (
          <div className="text-gray-400">Loading your flows...</div>
        ) : !flows || flows.length === 0 ? (
          <div className="border border-dashed border-gray-700 rounded-xl p-12 text-center bg-gray-900/50">
            <h3 className="text-xl font-medium mb-2">No flows yet</h3>
            <p className="text-gray-400 mb-6">Create your first visual workflow to get started.</p>
            <button 
              onClick={() => navigate('/flows/new')}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Plus size={18} />
              Design Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flows.map((flow: any) => (
              <div key={flow.id} className="bg-[#111111] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold truncate pr-4">{flow.name || 'Untitled Flow'}</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full whitespace-nowrap">
                    {Array.isArray(flow.nodes) ? flow.nodes.length : 0} nodes
                  </span>
                </div>
                {flow.description && (
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{flow.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                  <div className="text-xs text-gray-500">
                    Updated {formatDistanceToNow(new Date(flow.updatedAt), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/flows/${flow.id}`} className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors" title="Edit Flow">
                      <Edit3 size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowsList;
