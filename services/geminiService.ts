
import { GoogleGenAI, Modality } from "@google/genai";
import { MENU_DATA } from "../constants";

// Always use the recommended initialization pattern for GoogleGenAI

function createGeminiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_API_KEY is missing");
  }

  return new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `
You are the Wanderplate Concierge, a highly sophisticated AI assistant for Wanderplate, an upscale restaurant specializing in global culinary exploration and farm-to-table excellence.
Your tone is world-class, adventurous, yet refined.

Restaurant Details:
- Hours: 5:00 PM - 11:00 PM Daily
- Concept: A "Passport for your Palate" – focusing on international flavors with local, seasonal ingredients.
- Dress Code: Sophisticated Casual / Evening Attire.
- Location: 123 Culinary Ave, Gastronomy District.

Menu Items for reference:
${JSON.stringify(MENU_DATA, null, 2)}

Your goals:
1. Help guests with menu recommendations based on their flavor preferences (e.g., "I want something spicy", "I love seafood").
2. Answer questions about ingredients or global inspirations behind the dishes.
3. Suggest pairings (e.g., "The Miso Cod pairs beautifully with a crisp Sancerre").
4. If a user asks to reserve or order, politely guide them to the 'Reservations' or 'Menu' tabs.

Keep your responses concise, evocative, and helpful. Use markdown for formatting.
`;

export async function getConciergeResponse(userMessage: string, chatHistory: { role: 'user' | 'assistant', content: string }[]) {
  try {
    const response = await ai.models.generateContent({
      ai: 'createGeminiClient',
      model: 'gemini-3-flash-preview',
      contents: [
        ...chatHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, but I am momentarily adrift. How else may I guide your journey today?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our concierge is currently charting a course for another guest. Please try again in a moment.";
  }
}

/**
 * Generates an immersive audio narration for a menu item.
 */
export async function generateItemSpeech(itemName: string, description: string) {
  try {
    const prompt = `Say in a sophisticated, calm, and evocative storyteller voice: 
    "Discover the ${itemName}. ${description}"`;

    const response = await ai.models.generateContent({
      ai: 'createGeminiClient',
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, // Sophisticated masculine tone
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

/**
 * Generates a personalized Chef's response to a guestbook entry.
 */
export async function generateChefReflectionResponse(guestName: string, thought: string) {
  try {
    const prompt = `You are the Executive Chef of Wanderplate. A guest named ${guestName} just left a reflection in your Guestbook: "${thought}". 
    Respond as the Chef with 1-2 sentences. Your tone should be humble, deeply grateful, and evocative of culinary travel. Use terms like "voyage", "palate", or "culinary map".`;

    const response = await ai.models.generateContent({
      ai: 'createGeminiClient',
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text || "Thank you for joining our voyage. We look forward to your next discovery.";
  } catch (error) {
    return "Our kitchen is honored by your kind words. Safe travels until we meet again.";
  }
}
