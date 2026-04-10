# げんきグループ AIチャットボット セットアップ手順

## ファイル構成

```
genki-chatbot/
├── app/
│   ├── api/chat/route.ts     # APIエンドポイント
│   ├── embed/page.tsx        # Wix iframe埋め込み用ページ
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # 開発確認用トップページ
├── components/
│   └── ChatWidget.tsx        # チャットUIコンポーネント（メイン）
├── data/
│   └── faq.ts                # FAQ・施設情報データ
├── lib/
│   └── chatEngine.ts         # 応答ロジック（LLM差し替えポイント）
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ローカル開発

```bash
cd genki-chatbot
npm install
npm run dev
# → http://localhost:3000 で動作確認
# → http://localhost:3000/embed でWix用ページ確認
```

---

## 本番デプロイ（Vercel推奨）

### 1. GitHubリポジトリを作成してプッシュ

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/genki-chatbot.git
git push -u origin main
```

### 2. Vercelでデプロイ

1. https://vercel.com にアクセス
2. 「New Project」→ GitHubリポジトリを選択
3. そのまま「Deploy」をクリック
4. デプロイ完了後、URLが発行される（例: `https://genki-chatbot.vercel.app`）

---

## Wixへの埋め込み方法

### 手順

1. Wix管理画面 → ページを開く
2. 「＋追加」→「埋め込みコード」→「HTMLiframe」を選択
3. 以下のHTMLを貼り付ける：

```html
<iframe
  src="https://genki-chatbot.vercel.app/embed"
  style="
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    pointer-events: none;
    z-index: 9999;
  "
  allow="microphone"
  scrolling="no"
></iframe>
<style>
  iframe { pointer-events: none; }
  iframe * { pointer-events: all; }
</style>
```

> ⚠️ Wixのカスタムコード機能（サイト設定→カスタムコード）に貼る方が確実です。

### Wix カスタムコードへの追加（推奨）

1. Wix管理画面 →「サイト設定」→「カスタムコード」
2. 「コードを追加」→「body終了タグの前」を選択
3. 以下を貼り付け：

```html
<div id="genki-chat-container" style="position:fixed;bottom:0;right:0;width:100%;height:100%;pointer-events:none;z-index:9999;">
  <iframe
    src="https://genki-chatbot.vercel.app/embed"
    style="width:100%;height:100%;border:none;background:transparent;"
    scrolling="no"
    title="げんきグループ AIチャット"
  ></iframe>
</div>
<style>
  #genki-chat-container iframe { pointer-events: none; }
  #genki-chat-container { pointer-events: none; }
</style>
<script>
  // iframeからのクリックイベントをポインタ対応にする
  document.getElementById('genki-chat-container')
    .querySelector('iframe')
    .addEventListener('load', function() {
      this.style.pointerEvents = 'auto';
    });
</script>
```

---

## 将来のLLM（OpenAI/Claude）への差し替え

`lib/chatEngine.ts` の `generateResponse` 関数のみ変更するだけです。

```typescript
// 例: OpenAI APIへの差し替え
import OpenAI from "openai";
import { FAQ_ITEMS, FACILITY_INFO } from "@/data/faq";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateResponse(userInput: string): Promise<ChatResponse> {
  const systemPrompt = `
あなたはデイサービスげんきのご案内AIです。
施設情報: ${JSON.stringify(FACILITY_INFO)}
FAQデータ: ${JSON.stringify(FAQ_ITEMS)}
医療・介護の専門的判断には答えず、スタッフへの確認を促してください。
  `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ],
  });

  return {
    answer: completion.choices[0].message.content ?? "",
    showPhone: true,
  };
}
```

### 環境変数の設定（Vercel）

Vercel → プロジェクト設定 → Environment Variables に追加：

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `sk-...` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

---

## FAQの追加・編集

`data/faq.ts` の `FAQ_ITEMS` 配列に追記するだけです。

```typescript
{
  id: "new_topic",
  keywords: ["キーワード1", "キーワード2"],
  question: "質問文",
  answer: "回答文",
  showPhone: true,
},
```
