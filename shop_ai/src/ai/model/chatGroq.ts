import { ChatGroq } from "@langchain/groq";

const chatGroq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  apiKey: process.env.GROQ_API_KEY,
});

export default chatGroq;