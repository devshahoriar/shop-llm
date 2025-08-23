import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const googleModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 1.0,
  apiKey: process.env.GOOGLE_API_KEY,
});

export default googleModel;