"use client"
import { deleteFile, FileData, getFiles, uploadFile } from "@/utils/db"
import { Trash2Icon, UploadIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [fileList, setFileList] = useState<FileData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function fetchFiles() {
    try {
      setIsLoading(true)
      const files = (await getFiles()) as FileData[]
      setFileList(files)
      setErrorMsg(null)
    } catch (error) {
      console.error("Error fetching files:", error)
      setErrorMsg("Failed to load files. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setErrorMsg("You can only upload PDF files.")
      return
    }

    try {
      setIsLoading(true)
      await uploadFile(file)
      await fetchFiles()
    } catch (error) {
      console.error("Error processing PDF:", error)
      setErrorMsg("Failed to upload file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFile = async (
    ev: React.MouseEvent<HTMLButtonElement>,
    id: number,
  ) => {
    ev.preventDefault()
    ev.stopPropagation()

    try {
      setIsLoading(true)
      await deleteFile(id)
      await fetchFiles()
    } catch (error) {
      console.error("Error deleting file:", error)
      setErrorMsg("Failed to delete file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="pt-24 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl max-w-xl px-4 text-center font-bold">
        A new way of <span className="text-orange-500">learning</span> from{" "}
        <span className="text-orange-600 underline">PDFs</span>
      </h1>
      <div className="my-4 flex flex-col gap-4 items-center">
        <input
          id="fileinput"
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleFileUpload}
          disabled={isLoading}
        />
        <label
          htmlFor="fileinput"
          className={`
            text-center flex text-xl items-center border-2 border-zinc-800 border-dashed 
            gap-2 cursor-pointer p-2 rounded-xl transition-colors
            ${isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-zinc-800 hover:text-white'
            }
          `}
        >
          <UploadIcon /> <span>Upload your files here</span>
        </label>
      </div>
      <ul
        className="
          mb-20 md:grid grid-cols-1 flex flex-col md:grid-cols-4 lg:grid-cols-5 gap-2 
          box-border w-[90vw] md:w-[980px] lg:w-[1200px] min-h-[650px] p-4 
          rounded-xl bg-zinc-900
        "
      >
        {isLoading ? <div className="text-center text-xl">Loading files...</div>
          : errorMsg ? <div className="text-center text-red-500">{errorMsg}</div>
            : fileList.length === 0 ? <div className="text-center text-xl">No files uploaded yet</div>
              : fileList.map((file) => (
                <li key={file.id} className="w-full md:w-auto ">
                  <Link
                    href={`files/${file.id}`}
                    className="flex md:flex-col gap-2 md:w-56 border border-zinc-700 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    <div className="h-28 w-24 md:w-full md:h-64 overflow-hidden rounded-lg">
                      {file.thumbnail ? (
                        <Image
                          src={file.thumbnail}
                          alt={file.name}
                          width={224}
                          height={320}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-300">
                          No thumbnail
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center h-full w-full md:h-14">
                      <span
                        className="w-[90%] truncate"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <button
                        aria-label="Delete file"
                        className="bg-red-600 hover:bg-red-700 p-1.5 rounded flex justify-center items-center transition-colors"
                        onClick={(ev) => {
                          if (file.id) handleDeleteFile(ev, file.id)
                        }}
                      >
                        <Trash2Icon size={20} />
                      </button>
                    </div>
                  </Link>
                </li>
              ))}
      </ul>
    </main>
  )
}