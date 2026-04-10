// ============================================================
// Wix iframe埋め込み用ページ
// URL: https://your-domain.com/embed
// 背景透過 + ウィジェットのみ表示
// ============================================================
import ChatWidget from "@/components/ChatWidget";

export default function EmbedPage() {
  return (
    // 背景透過・余白なし・ウィジェットのみ
    <div
      className="embed-root"
      style={{
        background: "transparent",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ChatWidget />
    </div>
  );
}
