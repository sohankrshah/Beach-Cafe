import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.VITE_API_KEY;

    if (!apiKey) {
      console.error("API key missing on server");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const { contents, systemInstruction } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.status(200).json({
      text:
        response.text ??
        "I apologize, but I am momentarily adrift. How else may I guide your journey today?",
    });
  } catch (error) {
    console.error("Gemini Server Error:", error);
    return res.status(500).json({
      error:
        "Our concierge is currently charting a course for another guest.",
    });
  }
}
