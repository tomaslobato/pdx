import { GoogleGenerativeAI } from "@google/generative-ai"
import { Message } from "@/components/Chat"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

export async function ask(prompt: string, context: Message[], pdfText: string) {
  const contextHistory = context
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n")

  const fullPrompt = `
Core Instructions:
- Analyze the provided context carefully, focus on the PDF and Current Prompt
- Provide concise, and direct responses, with essential information.
- Adapt your tone and depth to the specific query
- If the PDF context is relevant, incorporate its insights
  
Context History: 
${contextHistory}

PDF: ${pdfText}

Current Prompt: ${prompt}
`

  const result = await model.generateContent(fullPrompt)
  return result.response.text()
}
