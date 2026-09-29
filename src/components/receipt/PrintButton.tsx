'use client'
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-[#E8001C] text-white text-sm font-semibold print:hidden">
      Print / Save as PDF
    </button>
  )
}
