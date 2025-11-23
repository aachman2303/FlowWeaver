import { Node, Edge } from 'reactflow';

export enum ModuleType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  SEARCH = 'SEARCH',
  ROUTER = 'ROUTER',
  ITERATOR = 'ITERATOR'
}

export interface ToolField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'password';
  options?: string[]; // For select inputs
  placeholder?: string;
  required?: boolean;
}

export interface ToolDefinition {
  id: string;
  name: string;
  type: ModuleType;
  icon: string; // Lucide icon name
  description: string;
  color: string;
  fields: ToolField[]; // Dynamic fields for the property panel
}

export interface NodeData {
  label: string;
  subLabel: string;
  toolId?: string;
  config?: Record<string, any>; // Stores user inputs from PropertyPanel
  output?: Record<string, any>; // Stores result after execution
  status?: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string; // New field for error handling
}

export interface ScenarioData {
  nodes: Node[];
  edges: Edge[];
}

export interface LogEntry {
  nodeId: string;
  nodeLabel: string;
  timestamp: string;
  status: 'success' | 'error' | 'info';
  message: string;
  data?: any;
}

export interface GeminiScenarioResponse {
  nodes: Array<{
    id: string;
    toolId: string;
    position: { x: number; y: number };
    data: { label: string; subLabel?: string };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
  }>;
}

export interface ScenarioVersion {
  id: string;
  name: string;
  timestamp: number;
  nodes: Node[];
  edges: Edge[];
}