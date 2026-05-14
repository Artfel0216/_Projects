import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const fitnessModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "Você é um personal trainer assistente da academia..." 
});