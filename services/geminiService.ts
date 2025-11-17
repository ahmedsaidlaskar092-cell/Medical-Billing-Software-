import { GoogleGenAI } from "@google/genai";
import { Bill, Product } from "../types";

// IMPORTANT: The API key must be set in the environment variables.
// Do not hardcode the API key here.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Generates quick dashboard insights using a fast model.
 */
export const getDashboardInsights = async (
    todaySale: number,
    yesterdaySale: number,
    avgBill: number,
    lowStockItems: Product[]
): Promise<string> => {
    if (!API_KEY) throw new Error("API key not configured.");
    try {
        const prompt = `
            Analyze the following daily sales data and provide 3 short, encouraging insights for a shop owner.
            Format the output as a single string with each insight separated by a newline character ('\\n').
            - Today's Total Sale: ${todaySale}
            - Yesterday's Total Sale: ${yesterdaySale}
            - Today's Average Bill Value: ${avgBill}
            - Low Stock Items Count: ${lowStockItems.length}
            - Low Stock Item Names: ${lowStockItems.map(p => p.name).join(', ')}

            Example output:
            Your average bill today is ₹${avgBill.toFixed(2)}!
            You have ${lowStockItems.length} items running low on stock.
            Today's performance vs yesterday: ${todaySale > yesterdaySale ? 'Up' : 'Down'} by ${Math.abs(todaySale - yesterdaySale).toFixed(2)}%. Keep it up!
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching dashboard insights:", error);
        throw new Error("Could not generate AI insights. Please check API key and try again.");
    }
};


/**
 * Performs complex analysis on sales data using the Pro model with thinking budget.
 */
export const getComplexSalesReport = async (bills: Bill[]): Promise<string> => {
    if (!API_KEY) throw new Error("API key not configured.");
    try {
        const prompt = `
        You are a business analyst. Analyze the provided sales data (last 30 days of bills) for a medical/retail shop. 
        Provide a detailed report covering:
        1.  Peak sales times/days.
        2.  Most popular products/tests.
        3.  Trends in payment methods.
        4.  Actionable suggestions for increasing sales and improving stock management.
        
        The data is in this JSON format:
        ${JSON.stringify(bills, null, 2)}
        
        Present your findings as a well-structured markdown report.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching complex sales report:", error);
        throw new Error("Failed to generate the advanced report. The Pro model may be busy.");
    }
};

/**
 * Generates a product description using a lightweight model.
 */
export const generateProductDescription = async (productName: string): Promise<string> => {
    if (!API_KEY) throw new Error("API key not configured.");
     try {
        const prompt = `Generate a short, concise, and appealing one-line description for a product named: "${productName}".`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating product description:", error);
        throw new Error("Failed to generate description.");
    }
};