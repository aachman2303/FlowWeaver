import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import * as Icons from 'lucide-react';
import { AVAILABLE_TOOLS } from '../constants';
import { ModuleType, NodeData } from '../types';

// Memoize to prevent unnecessary re-renders
export const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  // Try to find the tool definition based on toolId, fallback to name matching
  const tool = AVAILABLE_TOOLS.find(t => t.id === data.toolId) || AVAILABLE_TOOLS.find(t => t.name === data.label);

  // Dynamic Icon
  const IconComponent = tool && (Icons as any)[tool.icon] ? (Icons as any)[tool.icon] : Icons.Box;

  // Colors
  const colorClass = tool ? tool.color : 'bg-slate-500';
  
  // Logic checks
  const isTrigger = tool?.type === ModuleType.TRIGGER;
  const isRouter = tool?.type === ModuleType.ROUTER;

  // Status Logic
  const isRunning = data.status === 'running';
  const isError = data.status === 'error';
  const isSuccess = data.status === 'success';

  return (
    <div className="group relative">
        {/* 
           Backdrop Glow / Selection Ring 
           This element sits behind the main node and provides the glow/border effect 
        */}
        <div className={`
            absolute -inset-[2px] rounded-2xl transition-all duration-300
            ${selected ? 'bg-purple-500 opacity-100 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-200 opacity-0 group-hover:opacity-100'}
            ${isError ? '!bg-red-500 !opacity-100 !shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}
            ${isSuccess ? '!bg-green-500 !opacity-100 !shadow-[0_0_15px_rgba(34,197,94,0.4)]' : ''}
            ${isRunning ? '!bg-blue-400 !opacity-100 animate-pulse' : ''}
        `} />

        {/* Main Card Container */}
        <div className={`
            relative min-w-[280px] bg-white rounded-xl overflow-hidden transition-transform duration-200
            ${selected ? 'scale-[1.02]' : 'scale-100'}
        `}>
            {/* Top Accent Bar */}
            <div className={`h-1.5 w-full ${colorClass}`} />

            {/* Input Handle (Hidden for Triggers) */}
            {!isTrigger && (
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-white !rounded-full !-left-[9px] hover:!bg-purple-500 hover:!scale-125 transition-all" 
                />
            )}

            {/* Content Area */}
            <div className="p-4 flex gap-4 items-start">
                
                {/* Icon Box */}
                <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0
                    ${colorClass}
                    ${isRunning ? 'animate-bounce-slight' : ''}
                `}>
                    {isRunning ? (
                        <Icons.Loader2 size={24} className="animate-spin" />
                    ) : (
                        <IconComponent size={24} />
                    )}
                    
                    {/* Status Badge overlay on Icon */}
                    {isSuccess && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full p-0.5">
                            <Icons.Check size={10} className="text-white" />
                        </div>
                    )}
                    {isError && (
                        <div className="absolute -bottom-1 -right-1 bg-red-500 border-2 border-white rounded-full p-0.5">
                            <Icons.X size={10} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Text Details */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`
                            text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
                            ${isTrigger ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                            ${isRouter ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                            ${!isTrigger && !isRouter ? 'bg-slate-50 text-slate-500 border-slate-100' : ''}
                        `}>
                            {tool?.type || 'MODULE'}
                        </span>
                        {/* ID Badge (Optional, good for debugging or referencing) */}
                        <span className="text-[10px] text-slate-300 font-mono">#{data.toolId?.substring(0,3)}</span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-sm leading-tight truncate pr-2" title={data.label}>
                        {data.label}
                    </h3>
                    
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={data.subLabel}>
                        {data.subLabel || tool?.description}
                    </p>

                    {/* Output Preview (Mini) */}
                    {data.output && !isError && (
                        <div className="mt-2 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 inline-flex items-center gap-1">
                            <Icons.CheckCircle2 size={10} />
                            <span>Data processed</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message Footer */}
            {isError && data.errorMessage && (
                <div className="bg-red-50 border-t border-red-100 p-2.5 flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-200">
                     <div className="p-0.5 bg-red-100 rounded-full mt-0.5 text-red-600">
                        <Icons.AlertOctagon size={12} />
                     </div>
                     <p className="text-[11px] font-medium text-red-800 leading-snug break-words w-full">
                        {data.errorMessage}
                     </p>
                </div>
            )}

            {/* Output Handle */}
            <Handle 
                type="source" 
                position={Position.Right} 
                className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-white !rounded-full !-right-[9px] hover:!bg-purple-500 hover:!scale-125 transition-all" 
            />
        </div>
    </div>
  );
});