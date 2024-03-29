"use client";

import { ChevronDownIcon, ChevronUpIcon, Loader2Icon } from "lucide-react";
// import { revalidatePath } from "next/cache";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useState } from "react";
import { toast } from "sonner";

import { Document, Page, pdfjs } from "react-pdf";
import { Pdf } from "@/app/types";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { useResizeDetector } from "react-resize-detector";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type PdfRendererProps = {
  pdf: Pdf | null;
};

export default function PdfRenderer({ pdf }: PdfRendererProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { width, ref } = useResizeDetector();

  return (
    <div className="w-full lg:w-[36%] md:h-screen bg-white border border-r-black border-y-0 flex flex-col">
      <div className="flex justify-between items-center gap-1 px-3 bg-orange-400 h-12">
        <h1 className="md:text-lg underline text-black font-mono truncate">{pdf?.name}</h1>
        <div className="flex items-center gap-1">
          <Button
            disabled={currentPage <= 1}
            size="icon"
            variant="ghost"
            aria-label="previous page"
            onClick={
              () => setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1)) //validating to move to > 0 pages
            }
          >
            <ChevronUpIcon className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              value={currentPage}
              className="w-9 h-8"
              onChange={(ev) => {
                if (
                  Number(ev.target.value) > 0 &&
                  Number(ev.target.value) <= pdf?.pages!
                )
                  setCurrentPage(Number(ev.target.value));
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{pdf?.pages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={currentPage >= pdf?.pages!}
            size="icon"
            variant="ghost"
            aria-label="next page"
            onClick={
              () =>
                setCurrentPage((prev) =>
                  prev + 1 < pdf?.pages! ? prev + 1 : pdf?.pages!
                ) //validating to move to < lastpage pages
            }
          >
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div ref={ref}>
        <Document
          loading={
            <div className="flex justify-center">
              <Loader2Icon className="my-24 h-6 w-6 animate-spin" />
            </div>
          }
          onLoadError={() => {
            toast.error("there was an error loading your file");
            // revalidatePath("/");
          }}
          file={pdf?.secure_url}
          onLoadSuccess={() => {}}
        >
          <Page width={width ? width : 1} pageNumber={currentPage} />
        </Document>
      </div>
    </div>
  );
}
