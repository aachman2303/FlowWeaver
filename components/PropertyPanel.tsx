import React from 'react';
import { Node } from 'reactflow';
import { X, Settings, Info, AlertCircle, ShieldAlert } from 'lucide-react';
import { AVAILABLE_TOOLS } from '../constants';
import { NodeData } from '../types';

interface PropertyPanelProps {
  selectedNode: Node<NodeData> | null;
  onClose: () => void;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ selectedNode, onClose, onUpdateNode }) => {
  if (!selectedNode) return null;

  const toolInfo = AVAILABLE_TOOLS.find(t => t.id === selectedNode.data.toolId);
  const toolName = toolInfo?.name || selectedNode.data.label;
  const toolDesc = toolInfo?.description || 'Configure this module settings.';

  // Helper to update specific config field
  const handleConfigChange = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, {
        config: {
            ...selectedNode.data.config,
            [field]: value
        }
    });
  };

  const handleLabelChange = (val: string) => {
      onUpdateNode(selectedNode.id, { label: val });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl absolute right-0 top-0 z-20 animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
            <Settings size={18} className="text-purple-600" />
            <h3 className="font-semibold text-slate-800">Configuration</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-4">
            <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-xl text-white shadow-sm ${toolInfo?.color || 'bg-slate-500'}`}>
                    {/* We don't have access to the Icon component here easily without imports, but color helps */}
                   <span className="font-bold text-lg">{toolName.substring(0,2).toUpperCase()}</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">{toolName}</h2>
                    <p className="text-xs text-slate-500 mt-1">{toolDesc}</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Generic Label Field */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Node Name</label>
                    <input 
                        type="text" 
                        value={selectedNode.data.label}
                        onChange={(e) => handleLabelChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all"
                    />
                </div>

                {/* Dynamic Fields from Tool Definition */}
                {toolInfo?.fields && toolInfo.fields.length > 0 ? (
                    <div className="pt-4 border-t border-slate-100">
                         <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settings</span>
                        </div>
                        <div className="space-y-4">
                            {toolInfo.fields.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex justify-between">
                                        {field.label}
                                        {field.required && <span className="text-red-400">*</span>}
                                    </label>
                                    
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={selectedNode.data.config?.[field.name] || ''}
                                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm resize-none"
                                        />
                                    ) : field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                value={selectedNode.data.config?.[field.name] || ''}
                                                onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-white appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select an option...</option>
                                                {field.options?.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type}
                                            value={selectedNode.data.config?.[field.name] || ''}
                                            onChange={(e) => handleConfigChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3 text-slate-500 text-sm">
                        <Info size={16} />
                        <span>No additional settings for this module.</span>
                    </div>
                )}

                {/* Error Handling & Advanced Settings */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldAlert size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced & Debugging</span>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                            <input 
                                type="checkbox"
                                checked={selectedNode.data.config?.continueOnError || false}
                                onChange={(e) => handleConfigChange('continueOnError', e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">Continue on Error</span>
                                <span className="text-xs text-slate-500">Ignore failures and proceed</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 border border-red-100 bg-red-50/30 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
                            <input 
                                type="checkbox"
                                checked={selectedNode.data.config?.simulateError || false}
                                onChange={(e) => handleConfigChange('simulateError', e.target.checked)}
                                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-red-900">Simulate Error</span>
                                <span className="text-xs text-red-700">Force this module to fail</span>
                            </div>
                        </label>
                    </div>
                </div>

            </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
         {/* If output exists, show it */}
         {selectedNode.data.output && (
             <div className="mb-4 text-xs">
                 <div className="font-semibold text-slate-500 uppercase mb-1">Last Run Output</div>
                 <pre className="bg-slate-800 text-green-400 p-2 rounded overflow-x-auto max-h-32">
                     {JSON.stringify(selectedNode.data.output, null, 2)}
                 </pre>
             </div>
         )}
         
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors shadow-lg shadow-slate-200"
          >
              Done
          </button>
      </div>
    </div>
  );
};