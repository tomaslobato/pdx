"use client"

export default function Doc({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div className="md:w-full md:h-screen flex justify-center box-border">
      <object
        data={pdfUrl}
        type="application/pdf"
        className="w-full h-full"
      >
        <p>PDF cannot be displayed</p>
      </object>
    </div>
  )
}
