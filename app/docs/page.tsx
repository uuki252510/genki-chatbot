// ============================================================
// /docs — 知識ベース一覧・PDF出力ページ
// ブラウザで開いて Ctrl+P → 「PDFに保存」で出力
// URL: https://genki-chatbot.vercel.app/docs
// ============================================================

import { siteKnowledge } from "@/data/knowledge";
import { FACILITY_INFO } from "@/data/faq";
import PrintButton from "./PrintButton";

export const metadata = { title: "げんきグループ AIチャットボット 知識ベース" };

const PAGE_ICONS: Record<string, string> = {
  dayService:   "🌿",
  access:       "📍",
  nozomiHouse:  "🏠",
  officeGenki:  "🏢",
  recruit:      "💼",
  general:      "ℹ️",
};

export default function DocsPage() {
  const now = new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="docs-root">
      {/* ── グローバルスタイル ── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: "Hiragino Kaku Gothic ProN","Noto Sans JP",Meiryo,sans-serif; background: #f7f3ef; }
        .docs-root { max-width: 860px; margin: 0 auto; padding: 40px 32px; color: #3d3530; }

        /* 印刷時 */
        @media print {
          body { background: #fff; }
          .docs-root { padding: 0; max-width: 100%; }
          .no-print { display: none !important; }
          .page-card { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; }
          .docs-header { background: #5a9e6f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        .docs-header {
          background: #5a9e6f; color: #fff; border-radius: 12px;
          padding: 28px 32px; margin-bottom: 32px;
        }
        .docs-header h1 { margin: 0 0 6px; font-size: 22px; }
        .docs-header p  { margin: 0; font-size: 13px; opacity: 0.85; }

        .info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          background: #fff; border-radius: 10px; padding: 20px;
          margin-bottom: 28px; border: 1px solid #b2d8bc;
        }
        .info-item { font-size: 13px; }
        .info-item .label { color: #6b5f58; font-size: 11px; margin-bottom: 2px; }
        .info-item .value { font-weight: bold; color: #3d3530; }

        .section-title {
          font-size: 13px; font-weight: bold; color: #5a9e6f;
          text-transform: uppercase; letter-spacing: 1px;
          margin: 32px 0 12px; border-bottom: 2px solid #b2d8bc; padding-bottom: 6px;
        }

        .page-card {
          background: #fff; border-radius: 10px; padding: 20px 24px;
          margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          border-left: 4px solid #5a9e6f;
        }
        .page-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .page-card-icon { font-size: 22px; }
        .page-card-title { font-size: 17px; font-weight: bold; color: #3d3530; }
        .page-card-url { font-size: 11px; color: #6b5f58; margin-top: 2px; }

        .summary-box {
          background: #e8f5ec; border-radius: 8px; padding: 12px 16px;
          font-size: 13px; line-height: 1.7; color: #3d4030; margin-bottom: 16px;
        }

        .details-title { font-size: 12px; font-weight: bold; color: #5a9e6f; margin: 14px 0 8px; }
        .detail-row {
          display: flex; gap: 12px; font-size: 13px;
          border-bottom: 1px solid #f0e6d3; padding: 8px 0;
        }
        .detail-label { min-width: 110px; font-weight: bold; color: #3d3530; flex-shrink: 0; }
        .detail-content { color: #3d3530; line-height: 1.6; white-space: pre-wrap; }

        .faq-row {
          margin-bottom: 12px; padding: 10px 14px;
          background: #fdf6ee; border-radius: 8px; font-size: 13px;
        }
        .faq-q { font-weight: bold; color: #5a9e6f; margin-bottom: 4px; }
        .faq-q::before { content: "Q. "; }
        .faq-a { color: #3d3530; line-height: 1.6; white-space: pre-wrap; }
        .faq-a::before { content: "A. "; font-weight: bold; color: #6b5f58; }
        .faq-keywords { margin-top: 6px; }
        .keyword-chip {
          display: inline-block; font-size: 10px; padding: 1px 7px;
          background: #b2d8bc; border-radius: 10px; color: #3d4030; margin: 2px 2px 0 0;
        }

        .print-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #5a9e6f; color: #fff; border: none; cursor: pointer;
          padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: bold;
          margin-bottom: 24px;
        }
        .print-btn:hover { background: #3d7a52; }

        .footer {
          text-align: center; font-size: 11px; color: #6b5f58;
          margin-top: 40px; padding-top: 16px; border-top: 1px solid #b2d8bc;
        }
      `}</style>

      {/* ── ヘッダー ── */}
      <div className="docs-header">
        <h1>🌿 げんきグループ AIチャットボット 知識ベース</h1>
        <p>出力日：{now}　｜　genki-chatbot.vercel.app</p>
      </div>

      {/* ── 印刷ボタン ── */}
      <div className="no-print">
        <PrintButton />
      </div>

      {/* ── 基本情報 ── */}
      <div className="info-grid">
        <div className="info-item">
          <div className="label">メイン電話（デイサービスげんき・Office元気）</div>
          <div className="value">📞 {FACILITY_INFO.phone}</div>
        </div>
        <div className="info-item">
          <div className="label">希望の家 電話</div>
          <div className="value">📞 0743-57-0018</div>
        </div>
        <div className="info-item">
          <div className="label">受付時間</div>
          <div className="value">🕐 {FACILITY_INFO.hours}</div>
        </div>
        <div className="info-item">
          <div className="label">デイサービスげんき住所</div>
          <div className="value">📍 {FACILITY_INFO.address}</div>
        </div>
      </div>

      {/* ── 各ページの知識 ── */}
      <div className="section-title">ページ別 知識ベース</div>

      {Object.entries(siteKnowledge).map(([key, page]) => (
        <div key={key} className="page-card">
          {/* ページヘッダー */}
          <div className="page-card-header">
            <span className="page-card-icon">{PAGE_ICONS[key] ?? "📄"}</span>
            <div>
              <div className="page-card-title">{page.title}</div>
              <div className="page-card-url">{page.url}</div>
            </div>
          </div>

          {/* サマリー */}
          {page.summary && (
            <div className="summary-box">{page.summary}</div>
          )}

          {/* 詳細情報 */}
          {page.details.length > 0 && (
            <>
              <div className="details-title">📋 詳細情報</div>
              {page.details.map((d, i) => (
                <div key={i} className="detail-row">
                  <div className="detail-label">{d.label}</div>
                  <div className="detail-content">{d.content}</div>
                </div>
              ))}
            </>
          )}

          {/* FAQ */}
          {page.faqs.length > 0 && (
            <>
              <div className="details-title">💬 想定Q&A</div>
              {page.faqs.map((faq, i) => (
                <div key={i} className="faq-row">
                  <div className="faq-q">{faq.question}</div>
                  <div className="faq-a">{faq.answer}</div>
                  <div className="faq-keywords">
                    {faq.keywords.map((kw) => (
                      <span key={kw} className="keyword-chip">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      <div className="footer">
        このドキュメントは genki-chatbot の knowledge.ts から自動生成されています。<br />
        情報を追加・修正する場合は data/knowledge.ts を編集してください。
      </div>
    </div>
  );
}
