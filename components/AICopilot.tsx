import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { generateScenarioWithGemini } from '../services/geminiService';
import { GeminiScenarioResponse } from '../types';

interface AICopilotProps {
  onScenarioGenerated: (scenario: GeminiScenarioResponse) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ onScenarioGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateScenarioWithGemini(prompt);
      if (result) {
        onScenarioGenerated(result);
        setPrompt(''); // Clear after success
      } else {
        // Specific error message when result is null (often due to missing key)
        setError('Generation failed. Ensure API_KEY or GEMINI_API_KEY is set in environment.');
      }
    } catch (err) {
      setError('An error occurred. Check console logs for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
      <div className="bg-white/90 backdrop-blur-md border border-purple-100 shadow-xl rounded-2xl p-2 flex flex-col gap-2 ring-1 ring-purple-100/50 transition-all focus-within:ring-purple-300 focus-within:shadow-2xl">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-purple-600 animate-pulse">
            <Sparkles size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-12 py-3 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            placeholder="Describe a workflow... e.g., 'When I get a Gmail with an invoice, save to Sheets'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isGenerating}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border-t border-red-100 px-4 py-2 rounded-b-xl animate-in slide-in-from-top-1">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};