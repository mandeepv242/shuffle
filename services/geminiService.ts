import { GoogleGenAI } from "@google/genai";
import { HOST_SYSTEM_INSTRUCTION } from "../constants";

let aiClient: GoogleGenAI | null = null;

// Initialize safely
try {
  if (process.env.API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

export const generateHostCommentary = async (
  context: string,
  streak: number
): Promise<string> => {
  if (!aiClient) {
    return "Beep boop. I need an API Key to speak! (Check your environment variables)";
  }

  try {
    const prompt = `
      Context: ${context}
      Current Winning Streak: ${streak}
      
      Generate a short, punchy comment from the host Ace.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: HOST_SYSTEM_INSTRUCTION,
        temperature: 1.2, // High creativity
        maxOutputTokens: 60,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Technical difficulties folks! But keep playing!";
  }
};