import React from 'react';
import { X, Key, Shield, Info, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shadow-sm">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Setup & API Keys</h2>
              <p className="text-sm text-slate-500">How to configure the environment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
            <Shield size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Environment Configuration</p>
              <p>For the AI Copilot to function, you must set the Gemini API key in your environment variables. The app checks <code>process.env</code> for these values.</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Key size={18} className="text-purple-500" />
              API Key Configuration
            </h3>

            <div className="space-y-4">
              
              {/* Gemini Key */}
              <div className="p-4 rounded-xl border-2 border-purple-100 bg-purple-50/30 hover:border-purple-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-purple-900">1. Gemini API Key (Required)</h4>
                  <span className="text-xs font-mono bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">System Env</span>
                </div>
                <p className="text-sm text-slate-700 mb-3">
                  This key powers the "Text-to-Scenario" generation. It must be provided as an environment variable.
                </p>
                <div className="bg-white p-3 rounded-lg border border-purple-100 space-y-2 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted Variable Names</div>
                    <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                             <code className="text-xs font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700">API_KEY</code>
                             <span className="text-xs text-slate-400">(Standard)</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <code className="text-xs font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-700">GEMINI_API_KEY</code>
                             <span className="text-xs text-slate-400">(Alternative)</span>
                         </div>
                    </div>
                </div>
              </div>

              {/* OpenAI Key */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">2. OpenAI API Key (Optional)</h4>
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">Node Config</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Required for the <strong>ChatGPT</strong> module to execute real prompts.
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">How to set:</span> Click on a ChatGPT node on the canvas and enter your key in the settings panel.
                </p>
              </div>

              {/* Slack Token */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">3. Slack Bot Token (Optional)</h4>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">Node Config</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Required for the <strong>Slack</strong> module to send actual messages.
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">How to set:</span> Click on a Slack node and enter your Bot Token (xoxb-...).
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};