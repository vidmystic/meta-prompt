
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ZEUS_SYSTEM_INSTRUCTION } from '../constants';

// Store the chat session in memory for the SPA duration
let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    // Initialize the client right before creating the session to ensure latest API Key usage.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Create a fresh instance for the test
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
