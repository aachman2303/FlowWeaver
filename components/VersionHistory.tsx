import React, { useState } from 'react';
import { Clock, RotateCcw, Plus, X, Trash2, Save } from 'lucide-react';
import { ScenarioVersion } from '../types';

interface VersionHistoryProps {
  versions: ScenarioVersion[];
  onRestore: (version: ScenarioVersion) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ 
  versions, 
  onRestore, 
  onSave, 
  onDelete,
  onClose,
  isOpen 
}) => {
  const [newVersionName, setNewVersionName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newVersionName.trim()) return;
    onSave(newVersionName);
    setNewVersionName('');
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col max-h-[calc(100vh-120px)] animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
            <div className="flex items-center gap-2 text-slate-800">
                <Clock size={18} className="text-purple-600" />
                <h3 className="font-semibold text-sm">Version History</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Create New */}
        <div className="p-4 border-b border-slate-100 bg-white">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Save Current State</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="e.g. Before refactor" 
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button 
                    onClick={handleSave}
                    disabled={!newVersionName.trim()}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Save Version"
                >
                    <Save size={18} />
                </button>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
            {versions.length === 0 ? (
                <div className="text-center py-8 px-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3 text-slate-300">
                        <Clock size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No saved versions</p>
                    <p className="text-slate-400 text-xs mt-1">Save your current workflow state to restore it later.</p>
                </div>
            ) : (
                versions.slice().reverse().map((version) => (
                    <div key={version.id} className="p-3 rounded-lg border border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all group relative">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-slate-800 text-sm truncate pr-6">{version.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                            <span>{new Date(version.timestamp).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(version.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="ml-auto text-slate-300 group-hover:text-purple-400 text-[10px] font-mono">
                                {version.nodes.length} nodes
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => onRestore(version)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors"
                            >
                                <RotateCcw size={12} /> Restore
                            </button>
                            <button 
                                onClick={() => onDelete(version.id)}
                                className="px-2 py-1.5 bg-slate-50 border border-slate-200 text-slate-400 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                title="Delete Version"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};