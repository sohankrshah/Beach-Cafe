import { MENU_DATA } from "../constants";

const SYSTEM_INSTRUCTION = `
You are the Wanderplate Concierge, a highly sophisticated AI assistant for Wanderplate, an upscale restaurant specializing in global culinary exploration and farm-to-table excellence.
Your tone is world-class, adventurous, yet refined.

Restaurant Details:
- Hours: 5:00 PM - 11:00 PM Daily
- Concept: A "Passport for your Palate"
- Dress Code: Sophisticated Casual / Evening Attire
- Location: 123 Culinary Ave, Gastronomy District

Menu Items:
${JSON.stringify(MENU_DATA, null, 2)}

Goals:
1. Recommend dishes based on preferences
2. Explain ingredients and inspirations
3. Suggest pairings
4. Guide reservations politely

Keep responses concise, evocative, and helpful.
Use markdown.
`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function getConciergeResponse(
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          ...chatHistory.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
          { role: "user", parts: [{ text: userMessage }] },
        ],
        systemInstruction: SYSTEM_INSTRUCTION,
      }),
    });

    if (!res.ok) {
      throw new Error("Gemini API failed");
    }

    const data = await res.json();
    return data.text;
  } catch (error) {
    console.error("Frontend Gemini Error:", error);
    return "Our concierge is momentarily unavailable. Please try again shortly.";
  }
}
