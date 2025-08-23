import { ChatMistralAI } from "@langchain/mistralai";

const chatMistralAI = new ChatMistralAI({
  model: "mistral-large-latest",
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

export default chatMistralAI;