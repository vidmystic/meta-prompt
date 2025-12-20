
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ZEUS_SYSTEM_INSTRUCTION } from '../constants';

// Internal state to hold the current user's API Key
let userApiKey: string | null = localStorage.getItem('GEMINI_API_KEY');
let chatSession: Chat | null = null;

export const setApiKey = (key: string) => {
  userApiKey = key;
  localStorage.setItem('GEMINI_API_KEY', key);
  chatSession = null; // Reset session when key changes
};

export const getApiKey = () => userApiKey;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview', 
      config: {
        systemInstruction: ZEUS_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "응답을 생성할 수 없습니다. 다시 시도해 주세요.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "API_KEY_MISSING") {
      throw new Error("API_KEY_MISSING");
    }
    
    // Check for common auth errors
    const errorStr = String(error);
    if (errorStr.includes("API_KEY_INVALID") || errorStr.includes("invalid") || errorStr.includes("403") || errorStr.includes("401")) {
      throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};

export const testApiConnection = async (tempKey?: string): Promise<boolean> => {
  try {
    const keyToTest = tempKey || getApiKey();
    if (!keyToTest) return false;

    const ai = new GoogleGenAI({ apiKey: keyToTest });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'ping',
    });
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const resetSession = () => {
  chatSession = null;
};
