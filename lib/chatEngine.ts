// ============================================================
// チャットエンジン
// キーワードマッチングによるFAQ応答。
// 将来的にOpenAI/Claude APIへの差し替えはこのファイルのみ変更。
// ============================================================

import {
  FAQ_ITEMS,
  FACILITY_INFO,
  FALLBACK_ANSWER,
  RESTRICTED_ANSWER,
  RESTRICTED_KEYWORDS,
  type FaqItem,
} from "@/data/faq";

export type ChatResponse = {
  answer: string;
  showPhone: boolean;
  matchedFaq?: FaqItem;
};

// スコアリングによるFAQマッチング
function findBestMatch(input: string): FaqItem | null {
  const normalized = input
    .toLowerCase()
    .replace(/[？?！!。、，,\s]/g, "");

  let bestScore = 0;
  let bestItem: FaqItem | null = null;

  for (const item of FAQ_ITEMS) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += keyword.length; // 長いキーワードほど重視
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // スコアが低すぎる場合はnullを返す
  return bestScore >= 2 ? bestItem : null;
}

// 制限ワードチェック
function isRestrictedQuery(input: string): boolean {
  return RESTRICTED_KEYWORDS.some((kw) => input.includes(kw));
}

// ────────────────────────────────────────────────────────────
// メイン関数: ユーザー入力を受け取りレスポンスを返す
// LLMへの差し替え時はこの関数内のロジックを置き換える
// ────────────────────────────────────────────────────────────
export async function generateResponse(
  userInput: string
): Promise<ChatResponse> {
  // 制限ワードチェック
  if (isRestrictedQuery(userInput)) {
    return {
      answer: RESTRICTED_ANSWER,
      showPhone: true,
    };
  }

  // FAQマッチング
  const matched = findBestMatch(userInput);
  if (matched) {
    const phoneNote =
      matched.showPhone
        ? `\n\n📞 お急ぎの方は **${FACILITY_INFO.phone}** までご連絡ください。\n受付時間：${FACILITY_INFO.hours}`
        : "";
    return {
      answer: matched.answer + phoneNote,
      showPhone: matched.showPhone ?? false,
      matchedFaq: matched,
    };
  }

  // 電話番号・住所などの基本情報だけを聞かれたケース
  if (
    /電話番号|tel|ＴＥＬ|phone/.test(userInput.toLowerCase())
  ) {
    return {
      answer: `電話番号は **${FACILITY_INFO.phone}** です。\n受付時間：${FACILITY_INFO.hours}`,
      showPhone: false,
    };
  }
  if (/住所|〒|所在地/.test(userInput)) {
    return {
      answer: `住所は **${FACILITY_INFO.address}** です。`,
      showPhone: true,
    };
  }

  // フォールバック
  return {
    answer:
      FALLBACK_ANSWER +
      `\n\n📞 **${FACILITY_INFO.phone}**\n受付時間：${FACILITY_INFO.hours}`,
    showPhone: true,
  };
}

// ────────────────────────────────────────────────────────────
// クイック返信ボタンの定義
// ────────────────────────────────────────────────────────────
export const QUICK_REPLIES = [
  { label: "サービス内容", value: "サービス内容を教えてください" },
  { label: "料金について", value: "料金を教えてください" },
  { label: "アクセス・場所", value: "場所とアクセスを教えてください" },
  { label: "見学したい", value: "見学について教えてください" },
  { label: "求人情報", value: "求人情報を教えてください" },
  { label: "電話で問い合わせ", value: "電話番号を教えてください" },
] as const;
