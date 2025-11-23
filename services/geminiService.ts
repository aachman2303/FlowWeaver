import { GoogleGenAI, Type } from "@google/genai";
import { AVAILABLE_TOOLS } from "../constants";
import { GeminiScenarioResponse } from "../types";

// Helper to format tools for the prompt
const toolsList = AVAILABLE_TOOLS.map(t => `- ID: ${t.id}, Name: ${t.name} (${t.description})`).join('\n');

export const generateScenarioWithGemini = async (userPrompt: string): Promise<GeminiScenarioResponse | null> => {
  
  // ************************************************************************
  // * API KEY INTEGRATION & CONFIGURATION
  // * 
  // * The application expects the Gemini API key to be available in the 
  // * environment variables. 
  // *
  // * PREFERRED: process.env.API_KEY
  // * ALTERNATE: process.env.GEMINI_API_KEY
  // *
  // * This key is used to authenticate with the Google GenAI SDK below.
  // ************************************************************************
  
  const apiKey = (typeof process !== 'undefined' && process.env) 
    ? (process.env.API_KEY || process.env.GEMINI_API_KEY) 
    : null;

  if (!apiKey) {
    console.error("CRITICAL: Gemini API Key is missing. Please set process.env.API_KEY or process.env.GEMINI_API_KEY in your environment.");
    return null;
  }

  // Debug log to confirm key is loaded (masked for security)
  console.log(`Gemini Service: Initializing with key: ${apiKey.substring(0, 8)}...`);

  // Initialize the Gemini Client with the key
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an expert automation architect for a platform similar to Make (Integromat) or Zapier.
    Your task is to convert a user's natural language request into a structured workflow scenario (JSON).

    Available Tools/Modules you can use:
    ${toolsList}

    Rules:
    1. Analyze the user's intent to select the correct modules from the list above.
    2. Create a logical sequence (Nodes) and connections (Edges).
    3. If the user mentions a tool not in the list, try to substitute it with the most relevant generic tool or closest match (e.g., use 'webhook' for generic APIs).
    4. Layout: Assign 'position' {x, y} coordinates to nodes so they are arranged horizontally from left to right, spaced out by about 250px.
    5. 'data.label' should be the name of the tool. 'data.subLabel' should be a brief description of what it's doing (e.g., "Send to Manager").
    6. 'toolId' must match the ID provided in the list exactly.
    
    Return the response as a JSON object adhering to the specified schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  toolId: { type: Type.STRING },
                  position: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    }
                  },
                  data: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      subLabel: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  label: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
        console.warn("Gemini Service: Response received but text was empty.");
        return null;
    }
    
    return JSON.parse(text) as GeminiScenarioResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};