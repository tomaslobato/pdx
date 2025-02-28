import { FormEvent, useEffect, useState } from 'react'
import { ask } from './lib/ai'
import ReactMarkdown from "react-markdown"
import { UploadIcon } from 'lucide-react'

export type Message = {
  from: "ai" | "user"
  text: string
}

function App() {
  const [context, setContext] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(true)
  const [pdf, setPdf] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    async function initialQuestion() {
      const response = await ask("Introduce yourself", [])
      setContext(prev => [...prev, {text: response.text(), from:"ai"}])
      setLoading(false)
    }
    
    if (pdfUrl) initialQuestion()
  }, [pdfUrl])

  useEffect(() => {
    if (pdf) {
      const fileUrl = URL.createObjectURL(pdf)
      setPdfUrl(fileUrl)
      
      return () => {
        URL.revokeObjectURL(fileUrl)
      }
    }
  }, [pdf])

  function handleUploadPdf(ev: React.ChangeEvent<HTMLInputElement>) {
    if (ev.target.files && ev.target.files[0]) {
      setPdf(ev.target.files[0])
    }
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setContext(prev => [...prev, { from: "user", text: prompt }])
    setLoading(true)
    const response = await ask(prompt, context)
    setContext(prev => [...prev, { from: "ai", text: response.text() }])
    setPrompt("")
    setLoading(false)
  }

  return (
    <main className='flex lg:flex-row flex-col w-full '>
      <section className='w-full bg-zinc-800 text-white h-[75vh] lg:h-screen lg:w-1/2'>
      {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <p>PDF cannot be displayed</p>
          </object>
        ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <input type='file' className='hidden' accept='application/pdf' id='fileinput' onChange={handleUploadPdf}></input>
              <label htmlFor="fileinput" className='flex items-center gap-2 bg-zinc-700 text-2xl font-bold py-10 rounded-lg border-3 border-dashed border-green-500 hover:bg-zinc-900 transition cursor-pointer px-20'><UploadIcon/>Upload a PDF</label>
            </div>
          )}
      </section>
      <section className='text-white bg-zinc-900 lg:px-2 flex flex-col lg:w-1/2 h-200 lg:h-screen box-border'>
        <ul className='flex flex-col px-4 pt-4 pb-24 h-full overflow-auto'>
          {context.map((msg, index) => (
            <li key={index} className={`${msg.from === "ai" ? "self-start answer mt-4" : "self-end text-end mt-10"} max-w-5/6`}>
              <b>{msg.from === "ai" ? "AI" : "YOU"}:</b>
              <ReactMarkdown >{msg.text}</ReactMarkdown>
            </li>
          ))}
          {loading ? <li>...</li> : null}
        </ul>
        <form onSubmit={submit} className='fixed bottom-0 lg:relative text-white flex gap-1.5 h-14 p-1.5 rounded-t-lg pb-2 bg-green-600 w-full lg:w-full'>
          <input value={prompt} onChange={ev => setPrompt(ev.target.value)} className='w-full bg-green-700 outline-none rounded-lg px-2'></input>
          <button disabled={loading} className="disabled:bg-zinc-600 px-4 h-full bg-green-500 rounded-lg font-bold">ASK</button>
        </form>
      </section>
    </main>
  )
}

export default App
