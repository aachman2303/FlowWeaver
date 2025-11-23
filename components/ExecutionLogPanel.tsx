import React from 'react';
import { LogEntry } from '../types';
import { X, CheckCircle, AlertCircle, Info, Terminal } from 'lucide-react';

interface ExecutionLogPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutionLogPanel: React.FC<ExecutionLogPanelProps> = ({ logs, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex flex-col h-64 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
            <Terminal size={16} className="text-slate-600" />
            <h3 className="font-semibold text-slate-700 text-sm">Execution Logs</h3>
            <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{logs.length} events</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900 font-mono text-xs">
        {logs.length === 0 ? (
            <div className="text-slate-500 italic text-center mt-10">Waiting for execution...</div>
        ) : (
            logs.map((log, idx) => (
                <div key={idx} className="flex gap-3 items-start border-l-2 border-slate-700 pl-3 py-1 hover:bg-slate-800/50 transition-colors">
                    <div className="shrink-0 pt-0.5">
                        {log.status === 'success' && <CheckCircle size={14} className="text-green-500" />}
                        {log.status === 'error' && <AlertCircle size={14} className="text-red-500" />}
                        {log.status === 'info' && <Info size={14} className="text-blue-400" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-400">{log.timestamp.split('T')[1].split('.')[0]}</span>
                            <span className={`font-bold ${
                                log.status === 'success' ? 'text-green-400' : 
                                log.status === 'error' ? 'text-red-400' : 'text-blue-300'
                            }`}>[{log.nodeLabel}]</span>
                        </div>
                        <p className="text-slate-300">{log.message}</p>
                        {log.data && (
                            <pre className="mt-1 text-slate-500 overflow-x-auto whitespace-pre-wrap max-h-20 break-all">
                                {JSON.stringify(log.data)}
                            </pre>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};