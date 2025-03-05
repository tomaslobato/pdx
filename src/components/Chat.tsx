import { ask } from "@/utils/ai"
import { useEffect, useRef, useState } from "react"
import Markdown from "react-markdown"

export type Message = {
  role: "user" | "assistant"
  content: string
}

export default function Chat({ pdfText, name }: { pdfText: string, name: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function initialQuestion() {
      const res = await ask("summarize the pdf", [], pdfText)
      setMessages([{ role: "assistant", content: res }])
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

    try {
      const res = await ask(input, messages, pdfText)
      if (res) {
        setMessages((prev) => [...prev, { content: res, role: "assistant" }])
      }
    } catch (error) {
      console.error("Error in chat:", error)
      setMessages((prev) => [...prev, {
        content: "Sorry, there was an error processing your request.",
        role: "assistant"
      }])
    }
  }


  return (
    <div className="w-full md:w-1/2 h-screen">
      <header className="py-2 md:py-3.5 text-lg md:text-xl px-4 items-center flex bg-zinc-900 md:right-0 md:w-[50vw] w-full gap-1.5">
        Chat about <a className="underline">{name}</a>
      </header>
      <ul className="flex flex-col pb-6 pt-2 markdown box-border overflow-auto h-[88%]">
        {messages ? (
          messages.map((msg, i) => (
            <li key={i} className={`px-4 ${msg.role === "assistant" ? "" : "text-end pt-16"}`}>
              <span className={`${msg.role === "assistant" ? "text-orange-600" : "text-blue-500"} text-lg md:text-xl font-bold`}>{msg.role === "assistant" ? "AI:" : "You:"}</span>
              <Markdown className={`md:text-lg ${msg.role === "assistant" ? "text-orange-100" : "text-blue-200"}`}>{msg.content}</Markdown>
            </li>
          ))
        ) : (
          <li>No messages</li>
        )}
        <div ref={messagesEndRef} />
      </ul>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-2 w-full bg-zinc-900 rounded-t-lg h-14 md:h-16"
      >
        <input
          type="text"
          className="w-full outline-none px-3 md:py-1.5 rounded-lg"
          placeholder="..."
          onChange={(ev) => setInput(ev.target.value)}
          value={input}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-orange-600 px-1.5 md:px-3 rounded-lg border-2 text-xl border-orange-700"
        >
          Ask
        </button>
      </form>
    </div>
  )
}
