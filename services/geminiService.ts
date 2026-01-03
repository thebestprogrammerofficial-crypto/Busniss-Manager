import { GoogleGenAI } from "@google/genai";
import { ERPData } from "../types";

const getAIClient = () => {
  // Prioritize the key entered by the user and saved locally, fallback to env var
  const apiKey = localStorage.getItem('nexus_api_key') || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeERPData = async (data: ERPData, query: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    if (!ai) {
        return "Please enter your Gemini API Key in Settings to use the AI Analyst.";
    }

    const modelId = 'gemini-3-flash-preview';
    
    // Prepare a simplified version of data to avoid token limits
    const contextData = {
      businessName: data.userProfile?.businessName || 'The Company',
      location: data.userProfile?.location || 'Unknown',
      stockValuation: data.products.reduce((acc, p) => acc + (p.quantity * p.averageCost), 0),
      products: data.products.map(p => ({ name: p.name, qty: p.quantity, cost: p.averageCost })),
      recentTransactions: data.transactions.slice(-15),
      ledgerSummary: data.ledger.slice(-20),
    };

    const prompt = `
      You are the Chief Financial Officer (CFO) AI for ${contextData.businessName} located in ${contextData.location}.
      
      CONTEXT DATA:
      ${JSON.stringify(contextData, null, 2)}
      
      USER QUERY: "${query}"
      
      INSTRUCTIONS:
      1. Analyze the data strictly based on the numbers provided.
      2. Format your response using clear Markdown.
      3. Structure your response into these sections:
         - **Executive Summary**: A direct answer to the query.
         - **Key Insights**: Bullet points of trends or anomalies found in the data.
         - **Financial Recommendation**: Actionable advice based on the analysis.
      
      Keep the tone professional, concise, and helpful. Use currency formatting ($) for money.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a highly capable financial analyst AI.",
      }
    });

    return response.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "An error occurred while communicating with the AI Analyst. Please check your API Key.";
  }
};