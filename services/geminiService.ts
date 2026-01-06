import { GoogleGenAI, Modality } from "@google/genai";
import { MENU_DATA } from "../constants";

/**
 * Safely create Gemini client (Vite + Vercel safe)
 */
function createGeminiClient() {
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_API_KEY is missing");
  }

  return new GoogleGenAI({ apiKey });
}

const SYSTEM_INSTRUCTION = `
You are the Wanderplate Concierge, a highly sophisticated AI assistant for Wanderplate.

Restaurant Details:
- Hours: 5:00 PM - 11:00 PM Daily
- Concept: Passport for your Palate
- Dress Code: Sophisticated Casual
- Location: 123 Culinary Ave

Menu Items:
${JSON.stringify(MENU_DATA, null, 2)}
`;

export async function getConciergeResponse(
  userMessage: string,
  chatHistory: { role: "user" | "assistant"; content: string }[]
) {
  try {
    const ai = createGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: userMessage }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return (
      response.text ||
      "I apologize, but I am momentarily adrift. How else may I guide your journey?"
    );
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our concierge is assisting another guest. Please try again shortly.";
  }
}

/**
 * Generates immersive audio narration
 */
export async function generateItemSpeech(
  itemName: string,
  description: string
) {
  try {
    const ai = createGeminiClient();

    const prompt = `Say in a sophisticated, calm voice:
    "Discover the ${itemName}. ${description}"`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Charon" },
          },
        },
      },
    });

    return (
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null
    );
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

/**
 * Generates Chef's reflection response
 */
export async function generateChefReflectionResponse(
  guestName: string,
  thought: string
) {
  try {
    const ai = createGeminiClient();

    const prompt = `You are the Executive Chef of Wanderplate.
Guest: ${guestName}
Message: "${thought}"

Respond warmly in 1–2 sentences.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return (
      response.text ||
      "Thank you for joining our voyage. We look forward to welcoming you again."
    );
  } catch (error) {
    return "Our kitchen is honored by your kind words.";
  }
}
