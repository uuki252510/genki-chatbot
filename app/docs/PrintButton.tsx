"use client";

export default function PrintButton() {
  return (
    <button className="print-btn" onClick={() => window.print()}>
      🖨️ PDFに保存・印刷する
    </button>
  );
}
