"use client"

import Doc from "@/components/Doc"
import { addThumbnail, FileData, getFile } from "@/utils/db"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { pdfjs } from "react-pdf"
import Chat from "@/components/Chat"

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}

async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  const pdf = await pdfjs.getDocument(pdfUrl).promise
  let textContent = ""

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const text = await page.getTextContent()

    textContent +=
      text.items
        .filter((item) => "str" in item)
        .map((item) => item.str)
        .join(" ") + "\n"
  }

  URL.revokeObjectURL(pdfUrl)
  return textContent
}

async function createThumbnail(pdfBytes: ArrayBuffer) {
  // Create a copy of the ArrayBuffer
  const pdfCopy = pdfBytes.slice(0) // Create a copy of the ArrayBuffer

  const pdfDoc = await pdfjs.getDocument({ data: pdfCopy }).promise
  const firstPage = await pdfDoc.getPage(1)

  const viewport = firstPage.getViewport({ scale: 2 })
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  canvas.width = viewport.width
  canvas.height = viewport.height

  // Render the PDF page into the canvas context
  if (!context) throw new Error("Canvas context is null")
  await firstPage.render({ canvasContext: context, viewport }).promise

  // Convert the canvas to a base64 image
  return canvas.toDataURL("image/png")
}

export default function Page() {
  const { slug } = useParams()

  const [file, setFile] = useState<FileData | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfText, setPdfText] = useState<string | null>(null)

  //pdf rendering
  useEffect(() => {
    async function fetchFile() {
      if (typeof slug === "string") {
        const fileData = (await getFile(parseInt(slug))) as FileData
        setFile(fileData)

        if (fileData.content) {
          const blob = new Blob([fileData.content], {
            type: "application/pdf",
          })
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)

          const thumbnail = await createThumbnail(fileData.content)
          addThumbnail(parseInt(slug), thumbnail)
        }
      }
    }
    fetchFile()
  }, [slug])

  useEffect(() => {
    const setupAI = async () => {
      if (pdfUrl) {
        const content = await extractTextFromPDF(pdfUrl)
        setPdfText(content)
      }
    }

    setupAI()
  }, [pdfUrl])

  if (!file || !pdfUrl)
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="flex w-screen box-border md:h-auto flex-col md:flex-row overflow-auto">
      <div className="hidden md:block md:h-screen bg-zinc-800 w-full md:w-1/2 overflow-y-auto">
        <Doc pdfUrl={pdfUrl} />
      </div>
      {pdfText && <Chat pdfText={pdfText} name={file.name} />}
    </div>
  )
}
