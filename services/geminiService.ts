import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// ✅ Use Vite-compatible environment variable
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || ""
});

const SYSTEM_INSTRUCTION = `
You are "The Scribe," a world-class stationery expert at "Paper & Quill." 
You help customers find the perfect writing tools, paper types, and inks.
You are elegant, polite, and deeply knowledgeable about:
- Paper weights (GSM) and textures (Cold press vs Hot press, laid vs woven).
- Fountain pen nib sizes (EF, F, M, B) and materials (Steel, Gold).
- Ink properties (Sheen, shimmer, shading, waterproofness).
- Proper letter-writing etiquette and calligraphy.

When suggesting products, refer to general categories we carry: Pens, Paper, Planners, Ink, and Accessories.
Be concise but sophisticated in your responses.
`;

export const getScribeResponse = async (history: ChatMessage[]) => {
  try {
    const lastMessage = history[history.length - 1];
    const previousContent = history.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...previousContent,
        { role: "user", parts: [{ text: lastMessage.text }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9
      }
    });

    return (
      response.text ||
      "I'm sorry, I couldn't process that request at the moment. Perhaps we could discuss fine vellum instead?"
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The ink seems to have run dry on my connection. Please try again in a moment.";
  }
};
