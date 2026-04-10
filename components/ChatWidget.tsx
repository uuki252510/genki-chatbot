"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { QUICK_REPLIES } from "@/lib/chatEngine";
import { FACILITY_INFO } from "@/data/faq";

// ============================================================
// 型定義
// ============================================================
type MessageRole = "assistant" | "user";

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  text: "こんにちは。デイサービスげんきのご案内AIです。\nサービス内容・料金・アクセス・見学についてお気軽にご質問ください。",
  timestamp: new Date(),
};

// ============================================================
// ユーティリティ: **テキスト** を <strong> に変換
// ============================================================
function parseMarkdownBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-genki-green">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ============================================================
// 吹き出しコンポーネント
// ============================================================
function ChatBubble({ message }: { message: Message }) {
  const isBot = message.role === "assistant";

  return (
    <div
      className={`flex items-end gap-2 mb-3 animate-fade-in ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {/* アバター（bot側のみ） */}
      {isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-genki-green flex items-center justify-center text-white text-base shadow-sm">
          🌿
        </div>
      )}

      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isBot
            ? "bg-white text-genki-text rounded-bl-sm border border-genki-green-mid"
            : "bg-genki-green text-white rounded-br-sm"
        }`}
      >
        {/* 改行とMarkdownボールドを処理 */}
        {message.text.split("\n").map((line, i) => (
          <span key={i}>
            {parseMarkdownBold(line)}
            {i < message.text.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// タイピングインジケーター
// ============================================================
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-genki-green flex items-center justify-center text-white text-base shadow-sm">
        🌿
      </div>
      <div className="bg-white border border-genki-green-mid px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-2 h-2 rounded-full bg-genki-green animate-bounce-dot"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// クイック返信ボタン
// ============================================================
function QuickReplies({
  onSelect,
  disabled,
}: {
  onSelect: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="px-3 pb-2">
      <p className="text-xs text-genki-text-soft mb-2 px-1">よくあるご質問</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map((qr) => (
          <button
            key={qr.value}
            onClick={() => onSelect(qr.value)}
            disabled={disabled}
            className="text-sm px-3 py-2 rounded-full border border-genki-green text-genki-green bg-genki-green-light hover:bg-genki-green hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          >
            {qr.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// メインウィジェット
// ============================================================
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // 未読バッジ

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // スクロールを最下部へ
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // チャットを開いたらバッジをリセット
  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // メッセージ送信
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
      timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        const data = await res.json();

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: data.answer ?? "申し訳ございません。もう一度お試しください。",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            text: "通信エラーが発生しました。\nお電話（0743-23-1515）にてお問い合わせください。",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  // Enterキー送信（Shift+Enterで改行）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ============================================================
  // レンダリング
  // ============================================================
  return (
    <>
      {/* ── チャットパネル ───────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[92vw] max-w-[400px] h-[70vh] max-h-[580px] bg-genki-warm rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-up border border-genki-green-mid">

          {/* ヘッダー */}
          <div className="bg-genki-green px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  げんきグループ AIご案内
                </p>
                <p className="text-green-100 text-xs leading-tight">
                  デイサービスげんき
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white opacity-80 hover:opacity-100 text-2xl leading-none p-1"
              aria-label="チャットを閉じる"
            >
              ×
            </button>
          </div>

          {/* 電話バナー */}
          <a
            href={`tel:${FACILITY_INFO.phone}`}
            className="flex items-center justify-center gap-2 bg-genki-beige-dark text-genki-text py-2 text-sm font-medium hover:bg-genki-beige transition-colors flex-shrink-0"
          >
            <span>📞</span>
            <span className="font-bold">{FACILITY_INFO.phone}</span>
            <span className="text-xs text-genki-text-soft">
              {FACILITY_INFO.hours}
            </span>
          </a>

          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto px-3 py-4 min-h-0">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* クイック返信 */}
          {!isLoading && (
            <QuickReplies onSelect={sendMessage} disabled={isLoading} />
          )}

          {/* 入力エリア */}
          <div className="px-3 pb-4 pt-2 bg-genki-warm border-t border-genki-green-mid flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ご質問をどうぞ..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-genki-green-mid bg-white px-4 py-3 text-[15px] text-genki-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-genki-green leading-normal max-h-28 overflow-y-auto"
                style={{ minHeight: "48px" }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-genki-green text-white flex items-center justify-center text-xl shadow-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="送信"
              >
                ➤
              </button>
            </div>
            <p className="text-xs text-genki-text-soft text-center mt-2">
              このAIは一般的なご案内を行います。医療・介護判断はスタッフへご確認ください。
            </p>
          </div>
        </div>
      )}

      {/* ── 開閉ボタン（右下固定） ───────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-5 right-4 w-16 h-16 rounded-full bg-genki-green shadow-xl flex items-center justify-center text-3xl hover:scale-105 active:scale-95 transition-transform z-50"
        aria-label={isOpen ? "チャットを閉じる" : "チャットを開く"}
      >
        {isOpen ? (
          <span className="text-white text-2xl font-bold">×</span>
        ) : (
          <span>💬</span>
        )}

        {/* 未読バッジ */}
        {hasNewMessage && !isOpen && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
            1
          </span>
        )}
      </button>
    </>
  );
}
