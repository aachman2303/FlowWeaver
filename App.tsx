import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Node,
  BackgroundVariant,
  MiniMap
} from 'reactflow';
import * as Icons from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { PropertyPanel } from './components/PropertyPanel';
import { AICopilot } from './components/AICopilot';
import { VersionHistory } from './components/VersionHistory';
import { CustomNode } from './components/CustomNode';
import { ExecutionLogPanel } from './components/ExecutionLogPanel';
import { HelpModal } from './components/HelpModal';
import { runScenarioEngine } from './services/executionService';
import { INITIAL_NODES, INITIAL_EDGES, AVAILABLE_TOOLS } from './constants';
import { GeminiScenarioResponse, ScenarioVersion, NodeData, LogEntry } from './types';

const App: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Version Control State
  const [versions, setVersions] = useState<ScenarioVersion[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Show help on first load
  useEffect(() => {
    // Simple check to show help if user hasn't seen it, or just show it once per session for this demo
    const hasSeenHelp = sessionStorage.getItem('hasSeenHelp');
    if (!hasSeenHelp) {
      setIsHelpOpen(true);
      sessionStorage.setItem('hasSeenHelp', 'true');
    }
  }, []);

  // Register Custom Nodes
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Drag and Drop Handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const toolId = event.dataTransfer.getData('application/toolId');
      const toolDef = AVAILABLE_TOOLS.find(t => t.id === toolId);
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<NodeData> = {
        id: `node_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
            label: toolDef?.name || 'New Node', 
            subLabel: toolDef?.description || '',
            toolId: toolId,
            config: {},
            status: 'idle'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Cast to correct type
    setSelectedNode(node as Node<NodeData>);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleScenarioGenerated = useCallback((scenario: GeminiScenarioResponse) => {
    const newNodes = scenario.nodes.map((n) => ({
        id: n.id,
        position: n.position,
        type: 'custom',
        data: { 
            label: n.data.label, 
            subLabel: n.data.subLabel || '',
            toolId: n.toolId,
            status: 'idle',
            config: {}
        },
    }));

    const newEdges = scenario.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
    }));
    
    setNodes(newNodes as Node<NodeData>[]);
    setEdges(newEdges);
    
    setTimeout(() => {
        reactFlowInstance?.fitView({ padding: 0.2 });
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance]);

  const updateNodeData = (id: string, newData: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
             const updated = { ...node.data, ...newData };
             if (selectedNode?.id === id) {
                 setSelectedNode({ ...node, data: updated });
             }
             node.data = updated;
          }
          return node;
        })
      );
  };

  const handleRun = async () => {
      setIsRunning(true);
      setLogs([]); // Clear previous logs
      setIsLogsOpen(true);

      // Reset statuses and errors
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle', output: undefined, errorMessage: undefined } })));

      await runScenarioEngine(
          nodes,
          edges,
          (log) => setLogs(prev => [...prev, log]),
          (nodeId, status, output, errorMessage) => {
             setNodes(nds => nds.map(n => {
                 if (n.id === nodeId) {
                     return { ...n, data: { ...n.data, status, output, errorMessage }};
                 }
                 return n;
             }));
          }
      );

      setIsRunning(false);
  };

  // Version Control Handlers
  const handleSaveVersion = (name: string) => {
    const newVersion: ScenarioVersion = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        timestamp: Date.now(),
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges))
    };
    setVersions(prev => [...prev, newVersion]);
  };

  const handleRestoreVersion = (version: ScenarioVersion) => {
    setNodes(JSON.parse(JSON.stringify(version.nodes)));
    setEdges(JSON.parse(JSON.stringify(version.edges)));
    setIsHistoryOpen(false);
  };

  const handleDeleteVersion = (id: string) => {
    setVersions(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-200 ring-2 ring-purple-50">
                <Icons.Workflow size={20} />
            </div>
            <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    FlowWeaver
                </h1>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
            >
                <Icons.HelpCircle size={18} />
                <span className="hidden sm:inline">Setup & Keys</span>
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`flex items-center gap-2 p-2 px-3 rounded-lg transition-all border ${
                    isHistoryOpen 
                    ? 'bg-purple-50 border-purple-200 text-purple-700' 
                    : 'bg-white border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title="Version History"
            >
                <div className="relative">
                    <Icons.History size={18} />
                    {versions.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">History</span>
            </button>

            <button 
                onClick={handleRun}
                disabled={isRunning}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
                    isRunning 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 hover:shadow-lg shadow-slate-200'
                }`}
            >
                {isRunning ? (
                    <>
                        <Icons.Loader2 size={16} className="animate-spin" />
                        Running...
                    </>
                ) : (
                    <>
                        <Icons.Play size={16} fill="currentColor" />
                        Run Scenario
                    </>
                )}
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                <Icons.UserCircle size={24} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <ReactFlowProvider>
          <Sidebar />
          
          <div className="flex-1 relative h-full bg-slate-50/50" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background color="#cbd5e1" gap={24} size={1} variant={BackgroundVariant.Dots} />
              <Controls className="!bg-white !border !border-slate-200 !shadow-lg !rounded-xl !p-1 !text-slate-600" />
              <MiniMap 
                nodeStrokeColor={(n) => '#e2e8f0'}
                nodeColor={(n) => '#fff'}
                maskColor="rgba(248, 250, 252, 0.8)"
                className="!border !border-slate-200 !shadow-lg !rounded-xl overflow-hidden"
              />
            </ReactFlow>
            
            {/* AI Copilot Overlay */}
            <AICopilot onScenarioGenerated={handleScenarioGenerated} />
            
            {/* Version History Overlay */}
            <VersionHistory 
                isOpen={isHistoryOpen}
                versions={versions}
                onSave={handleSaveVersion}
                onRestore={handleRestoreVersion}
                onDelete={handleDeleteVersion}
                onClose={() => setIsHistoryOpen(false)}
            />

            {/* Help / Setup Modal */}
            <HelpModal 
              isOpen={isHelpOpen}
              onClose={() => setIsHelpOpen(false)}
            />

            {/* Execution Logs Overlay */}
            <ExecutionLogPanel 
                logs={logs} 
                isOpen={isLogsOpen} 
                onClose={() => setIsLogsOpen(false)} 
            />
          </div>
          
          {/* Properties Panel */}
          {selectedNode && (
            <PropertyPanel 
                selectedNode={selectedNode} 
                onClose={() => setSelectedNode(null)} 
                onUpdateNode={updateNodeData}
            />
          )}

        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default App;