import { ModuleType, ToolDefinition } from './types';

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  // Triggers
  {
    id: 'webhook',
    name: 'Webhook',
    type: ModuleType.TRIGGER,
    icon: 'Webhook',
    description: 'Triggers when data is received via HTTP.',
    color: 'bg-purple-500',
    fields: [
      { name: 'webhookName', label: 'Webhook Name', type: 'text', placeholder: 'My Webhook', required: true },
      { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT'], required: true }
    ]
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    type: ModuleType.TRIGGER,
    icon: 'CalendarClock',
    description: 'Triggers at a specific time interval.',
    color: 'bg-purple-600',
    fields: [
      { name: 'interval', label: 'Run Every', type: 'select', options: ['15 Minutes', '1 Hour', '1 Day', '1 Week'], required: true },
      { name: 'startTime', label: 'Start Time', type: 'text', placeholder: '09:00 AM' }
    ]
  },
  {
    id: 'gmail_watch',
    name: 'Gmail Watch',
    type: ModuleType.TRIGGER,
    icon: 'Mail',
    description: 'Triggers when a new email arrives.',
    color: 'bg-red-500',
    fields: [
      { name: 'connection', label: 'Gmail Connection', type: 'select', options: ['My Gmail Account'], required: true },
      { name: 'filter', label: 'Search Query', type: 'text', placeholder: 'from:boss@company.com subject:invoice' }
    ]
  },
  
  // Actions
  {
    id: 'sheets_add_row',
    name: 'Google Sheets',
    type: ModuleType.ACTION,
    icon: 'Table',
    description: 'Add a row to a spreadsheet.',
    color: 'bg-green-500',
    fields: [
      { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'Tabs > URL > ID', required: true },
      { name: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1' },
      { name: 'values', label: 'Row Values (Comma Separated)', type: 'textarea', placeholder: 'John Doe, john@example.com, $500' }
    ]
  },
  {
    id: 'slack_message',
    name: 'Slack',
    type: ModuleType.ACTION,
    icon: 'Hash',
    description: 'Send a message to a channel.',
    color: 'bg-blue-500',
    fields: [
      { name: 'token', label: 'Bot Token (xoxb-...)', type: 'password', placeholder: 'Leave empty to simulate' },
      { name: 'channel', label: 'Channel Name', type: 'text', placeholder: '#general', required: true },
      { name: 'message', label: 'Message Text', type: 'textarea', placeholder: 'Hello Team! New lead arrived.' }
    ]
  },
  {
    id: 'openai_completion',
    name: 'ChatGPT',
    type: ModuleType.ACTION,
    icon: 'Bot',
    description: 'Generate text or analyze content.',
    color: 'bg-emerald-600',
    fields: [
      { name: 'apiKey', label: 'OpenAI API Key', type: 'password', placeholder: 'sk-... (Leave empty to simulate)' },
      { name: 'model', label: 'Model', type: 'select', options: ['gpt-4o', 'gpt-3.5-turbo'], required: true },
      { name: 'prompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant.', required: true }
    ]
  },
  {
    id: 'crm_create',
    name: 'Salesforce',
    type: ModuleType.ACTION,
    icon: 'Cloud',
    description: 'Create a new lead or contact.',
    color: 'bg-sky-600',
    fields: [
      { name: 'objectType', label: 'Object Type', type: 'select', options: ['Lead', 'Contact', 'Opportunity'] },
      { name: 'fields', label: 'Field Mapping (JSON)', type: 'textarea', placeholder: '{"LastName": "Smith", "Company": "Acme"}' }
    ]
  },
  {
    id: 'email_send',
    name: 'Send Email',
    type: ModuleType.ACTION,
    icon: 'Send',
    description: 'Send an SMTP email.',
    color: 'bg-yellow-500',
    fields: [
        { name: 'to', label: 'To', type: 'text', placeholder: 'client@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome!' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email content goes here...' }
    ]
  },

  // Logic
  {
    id: 'router',
    name: 'Router',
    type: ModuleType.ROUTER,
    icon: 'GitFork',
    description: 'Split the flow into multiple paths.',
    color: 'bg-gray-600',
    fields: []
  },
  {
    id: 'filter',
    name: 'Filter',
    type: ModuleType.SEARCH,
    icon: 'Filter',
    description: 'Only allow data that matches criteria.',
    color: 'bg-orange-500',
    fields: [
        { name: 'condition', label: 'Condition', type: 'text', placeholder: 'value > 100' }
    ]
  }
];

export const INITIAL_NODES = [
  {
    id: '1',
    type: 'custom',
    data: { 
        label: 'Webhook', 
        subLabel: 'Incoming Order', 
        toolId: 'webhook',
        config: { webhookName: 'Order Hook', method: 'POST' }
    },
    position: { x: 100, y: 100 },
  },
];

export const INITIAL_EDGES = [];