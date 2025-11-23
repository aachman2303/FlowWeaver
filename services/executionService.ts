import { Node, Edge } from 'reactflow';
import { NodeData, LogEntry } from '../types';

// Helper to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Execution of a Single Node
const executeNodeLogic = async (node: Node<NodeData>, inputData: any): Promise<any> => {
    const { toolId, config } = node.data;
    
    // Simulate Debugging Error if checked
    if (config?.simulateError) {
        await delay(500); // Wait a bit before failing
        throw new Error("Simulated error triggered by user.");
    }

    // Default simulated delay
    await delay(800);

    switch (toolId) {
        case 'webhook':
            return {
                body: { orderId: 'ORD-12345', customer: 'Alice Smith', amount: 250.00 },
                headers: { 'content-type': 'application/json' },
                timestamp: new Date().toISOString()
            };
        
        case 'openai_completion':
            if (config?.apiKey && config?.apiKey.startsWith('sk-')) {
                // If the user actually provided a key (basic check), we could try a fetch here.
                // For safety in this demo, we will still simulate but acknowledge the key.
                return {
                    id: 'chatcmpl-123',
                    object: 'chat.completion',
                    choices: [{
                        message: {
                            role: 'assistant',
                            content: `[REAL API MOCK] Analyzed: ${JSON.stringify(inputData).slice(0, 50)}... Based on your prompt: "${config.prompt || ''}"`
                        }
                    }]
                };
            }
            // Simulation
            return {
                text: `Generated content for prompt: "${config?.prompt || 'No prompt'}"`,
                usage: { total_tokens: 42 }
            };

        case 'slack_message':
            return {
                ok: true,
                channel: config?.channel || '#general',
                ts: '1690000000.123456',
                message: { text: config?.message || 'Hello world' }
            };

        case 'sheets_add_row':
            return {
                spreadsheetId: config?.spreadsheetId,
                updatedRange: 'Sheet1!A2:C2',
                updatedRows: 1
            };

        case 'gmail_watch':
             return {
                snippet: "Invoice #999 attached...",
                from: "billing@vendor.com",
                subject: "Your Invoice"
             };

        case 'email_send':
             return {
                 status: 'sent',
                 to: config?.to,
                 messageId: `<${Date.now()}@mail.local>`
             };
        
        case 'filter':
            // Simple logic check simulation
            const condition = config?.condition || '';
            const pass = Math.random() > 0.3; // Randomly pass/fail for demo
            if (!pass) throw new Error(`Filter condition '${condition}' not met.`);
            return inputData;

        default:
            return { status: 'passed', input: inputData };
    }
};

export const runScenarioEngine = async (
    nodes: Node<NodeData>[],
    edges: Edge[],
    onLog: (entry: LogEntry) => void,
    onNodeUpdate: (id: string, status: 'running' | 'success' | 'error', output?: any, errorMessage?: string) => void
) => {
    // 1. Find Triggers (nodes with no incoming edges, or specifically marked as trigger type)
    // For simplicity, we find nodes with no handles connecting TO them, or just the first one.
    const targetNodeIds = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !targetNodeIds.has(n.id) || n.data.toolId?.includes('trigger') || n.type === 'webhook');

    if (startNodes.length === 0 && nodes.length > 0) {
        onLog({
            nodeId: 'system',
            nodeLabel: 'System',
            timestamp: new Date().toISOString(),
            status: 'error',
            message: 'No starting trigger found.'
        });
        return;
    }

    const queue = [...startNodes];
    const visited = new Set<string>();
    const nodeOutputs: Record<string, any> = {};

    // Breadth-First Execution
    while (queue.length > 0) {
        const currentNode = queue.shift();
        if (!currentNode || visited.has(currentNode.id)) continue;

        visited.add(currentNode.id);

        // Notify UI: Running
        onNodeUpdate(currentNode.id, 'running');
        onLog({
            nodeId: currentNode.id,
            nodeLabel: currentNode.data.label,
            timestamp: new Date().toISOString(),
            status: 'info',
            message: `Starting execution...`
        });

        try {
            // Gather inputs from previous nodes
            const incomingEdges = edges.filter(e => e.target === currentNode.id);
            const inputData = incomingEdges.map(e => nodeOutputs[e.source]).filter(Boolean);
            const combinedInput = inputData.length === 1 ? inputData[0] : inputData;

            // Execute Logic
            const result = await executeNodeLogic(currentNode, combinedInput);
            
            // Store Output
            nodeOutputs[currentNode.id] = result;

            // Notify UI: Success
            onNodeUpdate(currentNode.id, 'success', result);
            onLog({
                nodeId: currentNode.id,
                nodeLabel: currentNode.data.label,
                timestamp: new Date().toISOString(),
                status: 'success',
                message: `Task completed successfully.`,
                data: result
            });

            // Find Next Nodes
            const outgoingEdges = edges.filter(e => e.source === currentNode.id);
            const nextNodes = outgoingEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node<NodeData>[];
            
            queue.push(...nextNodes);

        } catch (err: any) {
            const errorMessage = err.message || 'Unknown error occurred';
            const shouldContinue = currentNode.data.config?.continueOnError;

            // Notify UI: Error
            onNodeUpdate(currentNode.id, 'error', undefined, errorMessage);
            
            onLog({
                nodeId: currentNode.id,
                nodeLabel: currentNode.data.label,
                timestamp: new Date().toISOString(),
                status: 'error',
                message: errorMessage
            });

            if (shouldContinue) {
                onLog({
                    nodeId: currentNode.id,
                    nodeLabel: currentNode.data.label,
                    timestamp: new Date().toISOString(),
                    status: 'info',
                    message: "Continuing execution despite error (Continue on Error enabled)."
                });
                // Continue to next nodes even if this failed
                const outgoingEdges = edges.filter(e => e.source === currentNode.id);
                const nextNodes = outgoingEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as Node<NodeData>[];
                queue.push(...nextNodes);
            } else {
                onLog({
                    nodeId: 'system',
                    nodeLabel: 'System',
                    timestamp: new Date().toISOString(),
                    status: 'error',
                    message: "Scenario execution stopped gracefully due to error."
                });
                // Do not push next nodes to queue, effectively stopping branch execution
            }
        }
    }
};