import React from 'react';
import { AVAILABLE_TOOLS } from '../constants';
import * as Icons from 'lucide-react';
import { ModuleType } from '../types';

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, toolId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/toolId', toolId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = [ModuleType.TRIGGER, ModuleType.ACTION, ModuleType.ROUTER, ModuleType.SEARCH];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-800">Modules</h2>
        <p className="text-xs text-slate-500 mt-1">Drag to canvas to add</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {categories.map((cat) => (
          <div key={cat}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{cat}S</h3>
            <div className="space-y-2">
              {AVAILABLE_TOOLS.filter(t => t.type === cat).map((tool) => {
                const IconComponent = (Icons as any)[tool.icon] || Icons.Box;
                return (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-white hover:border-purple-400 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
                    onDragStart={(event) => onDragStart(event, 'default', tool.id)}
                    draggable
                  >
                    <div className={`p-2 rounded-md text-white ${tool.color}`}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700 group-hover:text-purple-600">
                        {tool.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};