// ============================================================
// chatEngine.ts — 知識ベース優先の回答エンジン
//
// 回答優先度:
//   1. siteKnowledge の faqs[] キーワード完全一致
//   2. siteKnowledge の details[] キーワード部分一致
//   3. siteKnowledge の summary（ページ概要）
//   4. 旧 FAQ_ITEMS（後方互換）
//   5. フォールバック「お問い合わせください」
//
// LLMへの差し替え: この関数の中身を置き換えるだけでOK
// ============================================================

import { siteKnowledge, intentMap } from "@/data/knowledge";
import { FAQ_ITEMS, FACILITY_INFO, FALLBACK_ANSWER, RESTRICTED_ANSWER, RESTRICTED_KEYWORDS } from "@/data/faq";

export type ChatResponse = {
  answer: string;
  showPhone: boolean;
  sourcePage?: string;  // どのページ情報を参照したか
};

const PHONE_FOOTER = `\n\n📞 お急ぎの方は **${FACILITY_INFO.phone}** まで\n🕐 受付時間：${FACILITY_INFO.hours}`;

// ── ① インテント検出（どのページの質問か） ──────────────────
function detectIntent(input: string): (keyof typeof siteKnowledge)[] {
  const matched: (keyof typeof siteKnowledge)[] = [];
  for (const { keywords, page } of intentMap) {
    if (keywords.some((kw) => input.includes(kw))) {
      matched.push(page);
    }
  }
  return matched.length > 0 ? matched : ["general"];
}

// ── ② FAQエントリのスコアリング ─────────────────────────────
function scoreFaq(input: string, keywords: string[]): number {
  return keywords.reduce((score, kw) => {
    return input.includes(kw) ? score + kw.length : score;
  }, 0);
}

// ── ③ ページ知識から回答を生成 ──────────────────────────────
function searchKnowledge(input: string, pages: (keyof typeof siteKnowledge)[]): {
  answer: string;
  sourcePage: string;
} | null {
  let bestFaqScore = 0;
  let bestFaqAnswer = "";
  let bestFaqPage = "";

  let bestDetailScore = 0;
  let bestDetailAnswer = "";
  let bestDetailPage = "";

  for (const pageKey of pages) {
    const page = siteKnowledge[pageKey];
    if (!page) continue;

    // FAQを探す
    for (const faq of page.faqs) {
      const score = scoreFaq(input, faq.keywords);
      if (score > bestFaqScore) {
        bestFaqScore = score;
        bestFaqAnswer = faq.answer;
        bestFaqPage = page.title;
      }
    }

    // details を探す
    for (const detail of page.details) {
      const score = scoreFaq(input, detail.keywords);
      if (score > bestDetailScore) {
        bestDetailScore = score;
        bestDetailAnswer = `【${detail.label}】\n${detail.content}`;
        bestDetailPage = page.title;
      }
    }
  }

  // FAQが強くマッチ
  if (bestFaqScore >= 2) {
    return { answer: bestFaqAnswer, sourcePage: bestFaqPage };
  }

  // detailがマッチ
  if (bestDetailScore >= 2) {
    return { answer: bestDetailAnswer, sourcePage: bestDetailPage };
  }

  // summaryを返す（ページが1つに絞れている場合）
  if (pages.length === 1 && pages[0] !== "general") {
    const page = siteKnowledge[pages[0]];
    return {
      answer: page.summary,
      sourcePage: page.title,
    };
  }

  return null;
}

// ── ④ 旧FAQフォールバック（後方互換） ──────────────────────
function searchLegacyFaq(input: string): string | null {
  let bestScore = 0;
  let bestAnswer: string | null = null;

  for (const item of FAQ_ITEMS) {
    let score = 0;
    for (const kw of item.keywords) {
      if (input.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = item.answer;
    }
  }
  return bestScore >= 2 ? bestAnswer : null;
}

// ── ⑤ 基本情報の直接マッチ ─────────────────────────────────
function matchBasicInfo(input: string): string | null {
  if (/電話番号|tel|ＴＥＬ/i.test(input)) {
    return `📞 **${FACILITY_INFO.phone}**（デイサービスげんき・Office元気）\n📞 **0743-57-0018**（希望の家）\n🕐 受付時間：${FACILITY_INFO.hours}`;
  }
  if (/住所|〒|所在地/.test(input)) {
    return `【デイサービスげんき・Office元気】\n〒636-0012 奈良県生駒郡安堵町東安堵248-8\n📞 0743-23-1515\n\n【希望の家】\n〒639-1061 奈良県生駒郡安堵町東安堵248-1\n📞 0743-57-0018`;
  }
  return null;
}

// ── メイン関数 ──────────────────────────────────────────────
export async function generateResponse(userInput: string): Promise<ChatResponse> {
  const input = userInput.trim();

  // 制限ワードチェック
  if (RESTRICTED_KEYWORDS.some((kw) => input.includes(kw))) {
    return { answer: RESTRICTED_ANSWER, showPhone: true };
  }

  // 基本情報の直接マッチ
  const basic = matchBasicInfo(input);
  if (basic) {
    return { answer: basic, showPhone: false };
  }

  // インテント検出
  const pages = detectIntent(input);

  // 知識ベース検索
  const knowledgeResult = searchKnowledge(input, [
    ...pages,
    // 全ページも補助的に検索
    ...Object.keys(siteKnowledge) as (keyof typeof siteKnowledge)[],
  ]);

  if (knowledgeResult) {
    const needsPhone = !/0743/.test(knowledgeResult.answer);
    return {
      answer: knowledgeResult.answer + (needsPhone ? PHONE_FOOTER : ""),
      showPhone: needsPhone,
      sourcePage: knowledgeResult.sourcePage,
    };
  }

  // 旧FAQフォールバック
  const legacy = searchLegacyFaq(input);
  if (legacy) {
    return { answer: legacy, showPhone: true };
  }

  // 最終フォールバック
  return {
    answer: FALLBACK_ANSWER + PHONE_FOOTER,
    showPhone: true,
  };
}

// クイック返信ボタン定義
export const QUICK_REPLIES = [
  { label: "サービス内容", value: "デイサービスのサービス内容を教えてください" },
  { label: "料金について", value: "料金を教えてください" },
  { label: "アクセス・場所", value: "場所とアクセスを教えてください" },
  { label: "見学したい", value: "見学について教えてください" },
  { label: "希望の家", value: "希望の家について教えてください" },
  { label: "求人情報", value: "求人情報を教えてください" },
] as const;
