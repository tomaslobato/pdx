import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "../App"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY)
const model = genAI.getGenerativeModel({model:"gemini-2.0-flash-lite"})

export async function ask(prompt: string, context: Message) {
  console.log(context)
  const result = await model.generateContent("instructions: answer briefly but not so much, possitively, and with seriousness. PROMPT: " + prompt)
  return result.response
}