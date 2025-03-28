import { ask } from "@/utils/ai"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"

export type Message = {
  role: "user" | "assistant" | "error"
  content: string
}

export default function Chat({ pdfText, name }: { pdfText: string, name: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initialQuestion() {
      try {
        setIsLoading(true)
        const res = await ask("summarize the pdf", [], pdfText)
        setMessages([{ role: "assistant", content: res }])
        console.log(res)
      } catch (error) {
        console.error("Error getting initial summary:", error)
        setMessages([{
          role: "error",
          content: "I had trouble summarizing this document. Please ask a specific question about it instead."
        }])
      } finally {
        setIsLoading(false)
      }
    }

    initialQuestion()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { content: input, role: "user" }])
    setInput("")
    setIsLoading(true)

    try {
      const res = await ask(input, messages, pdfText)
      if (res) {
        setMessages((prev) => [...prev, { content: res, role: "assistant" }])
      }
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prev) => [...prev, {
        content: "Sorry, there was an error processing your request.",
        role: "error"
      }])
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="w-full md:w-1/2 h-screen">
      <header className="py-2 md:py-3.5 text-lg md:text-xl px-4 items-center flex bg-zinc-900 md:right-0 md:w-[50vw] w-full gap-1.5">
        Chat about <a className="underline">{name}</a>
      </header>
      <ul className="flex flex-col py-2 markdown box-border overflow-auto h-[88%]">
        {messages.length === 0 && isLoading ? (
          <li className="px-4 py-2">
            <div className="animate-pulse text-orange-600">Summarizing document...</div>
          </li>
        ) : (
          messages.map((msg, i) => (
            <li key={i} className={`px-4 ${msg.role === "assistant" || msg.role === "error" ? "" : "text-end pt-16"}`}>
              <span className={`${msg.role === "assistant" ? "text-orange-600" : msg.role === "error" ? "text-red-600" : "text-blue-600"} text-lg md:text-xl font-bold`}>{msg.role === "assistant" ? "AI" : msg.role === "error" ? "Error" : "You:"}</span>
              <Markdown className={`md:text-lg ${msg.role === "assistant" ? "text-orange-100" : msg.role === "error" ? "text-red-200" : "text-blue-200"}`}>{msg.content}</Markdown>
            </li>
          ))
        )}
        <div ref={messagesEndRef} />
      </ul>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-2 w-[96%] bg-zinc-900 rounded-lg m-auto h-12 md:h-14"
      >
        <input
          type="text"
          className="w-full outline-none px-3  rounded-lg"
          placeholder="..."
          onChange={(ev) => setInput(ev.target.value)}
          value={input}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-orange-700 font-bold px-1.5 md:px-3 rounded-lg border-2 text-xl border-orange-800 disabled:bg-zinc-800"
          autoFocus
        >
          Ask
        </button>
      </form>
    </div>
  )
}
