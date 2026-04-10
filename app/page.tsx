// ============================================================
// メインページ（開発確認用）
// 本番はWix iframeから /embed を使用する
// ============================================================
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-genki-beige flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-2xl font-bold text-genki-green mb-2">
          デイサービスげんき
        </h1>
        <p className="text-genki-text-soft text-base">
          AIチャットボット動作確認ページです。
          <br />
          右下のボタンからチャットをお試しください。
        </p>
        <div className="mt-8 p-4 bg-white rounded-xl border border-genki-green-mid text-sm text-genki-text-soft text-left space-y-1">
          <p>📞 0743-23-1515</p>
          <p>🕐 受付時間：9:00〜17:00</p>
          <p>📍 奈良県生駒郡安堵町東安堵248-8</p>
        </div>
      </div>

      {/* チャットウィジェット */}
      <ChatWidget />
    </main>
  );
}
