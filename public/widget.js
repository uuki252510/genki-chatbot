(function () {
  // 二重読み込み防止
  if (document.getElementById('genki-chat-widget')) return;

  // ── スタイル注入 ──────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #genki-chat-widget * { box-sizing: border-box; font-family: "Hiragino Kaku Gothic ProN","Noto Sans JP",Meiryo,sans-serif; }
    #genki-chat-widget { position: fixed; bottom: 20px; right: 16px; z-index: 999999; }

    #genki-toggle-btn {
      width: auto; height: auto; border-radius: 50px;
      background: #5a9e6f; border: none; cursor: pointer;
      padding: 12px 18px 12px 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: genki-pulse 2.5s infinite;
    }
    #genki-toggle-btn:hover { transform: scale(1.06); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
    #genki-toggle-icon { font-size: 26px; line-height: 1; }
    #genki-toggle-label { color: #fff; font-weight: bold; font-size: 14px; line-height: 1.3; text-align: left; }
    #genki-toggle-label span { display: block; font-size: 10px; font-weight: normal; opacity: 0.9; }
    @keyframes genki-pulse {
      0%,100% { box-shadow: 0 4px 20px rgba(90,158,111,0.4); }
      50% { box-shadow: 0 4px 28px rgba(90,158,111,0.75); }
    }

    #genki-badge {
      position: absolute; top: -2px; right: -2px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #e53e3e; color: #fff; font-size: 11px;
      font-weight: bold; display: flex; align-items: center; justify-content: center;
    }

    #genki-panel {
      position: absolute; bottom: 72px; right: 0;
      width: min(92vw, 380px); height: min(70vh, 560px);
      background: #f7f3ef; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      border: 1px solid #b2d8bc;
      animation: genki-slide-up 0.3s ease;
    }
    @keyframes genki-slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #genki-header {
      background: #5a9e6f; padding: 12px 16px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    #genki-header-left { display: flex; align-items: center; gap: 8px; }
    #genki-header-icon { font-size: 22px; }
    #genki-header-title { color: #fff; font-weight: bold; font-size: 15px; line-height: 1.2; }
    #genki-header-sub { color: #d1f0da; font-size: 11px; }
    #genki-close-btn { color: #fff; background: none; border: none; font-size: 22px; cursor: pointer; opacity: 0.8; padding: 4px; line-height: 1; }
    #genki-close-btn:hover { opacity: 1; }

    #genki-phone-bar {
      background: #f0e6d3; padding: 8px 16px;
      display: flex; align-items: center; justify-content: center;
      gap: 8px; font-size: 13px; color: #3d3530;
      text-decoration: none; flex-shrink: 0;
    }
    #genki-phone-bar:hover { background: #fdf6ee; }

    #genki-messages {
      flex: 1; overflow-y: auto; padding: 12px;
      display: flex; flex-direction: column; gap: 0;
    }
    #genki-messages::-webkit-scrollbar { width: 4px; }
    #genki-messages::-webkit-scrollbar-thumb { background: #b2d8bc; border-radius: 2px; }

    .genki-msg { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 12px; }
    .genki-msg.user { flex-direction: row-reverse; }

    .genki-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: #5a9e6f; display: flex; align-items: center;
      justify-content: center; font-size: 16px; flex-shrink: 0;
    }

    .genki-bubble {
      max-width: 82%; padding: 10px 14px; border-radius: 16px;
      font-size: 14px; line-height: 1.6; white-space: pre-wrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .genki-msg.bot .genki-bubble {
      background: #fff; color: #3d3530;
      border: 1px solid #b2d8bc; border-bottom-left-radius: 4px;
    }
    .genki-msg.user .genki-bubble {
      background: #5a9e6f; color: #fff; border-bottom-right-radius: 4px;
    }
    .genki-bubble b { font-weight: 700; color: #3d7a52; }
    .genki-msg.user .genki-bubble b { color: #d1f0da; }

    #genki-typing { display: flex; align-items: flex-end; gap: 8px; margin-bottom: 12px; }
    .genki-dot-wrap { display: flex; gap: 4px; align-items: center; padding: 10px 14px; background: #fff; border: 1px solid #b2d8bc; border-radius: 16px; border-bottom-left-radius: 4px; }
    .genki-dot { width: 7px; height: 7px; border-radius: 50%; background: #5a9e6f; animation: genki-bounce 1.2s infinite; }
    .genki-dot:nth-child(2) { animation-delay: 0.2s; }
    .genki-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes genki-bounce {
      0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    #genki-quick { padding: 4px 12px 8px; flex-shrink: 0; }
    #genki-quick p { font-size: 11px; color: #6b5f58; margin: 0 0 6px 4px; }
    #genki-quick-btns { display: flex; flex-wrap: wrap; gap: 6px; }
    .genki-qr {
      font-size: 12px; padding: 6px 12px; border-radius: 20px;
      border: 1px solid #5a9e6f; color: #5a9e6f; background: #e8f5ec;
      cursor: pointer; font-weight: 500; transition: all 0.15s;
    }
    .genki-qr:hover { background: #5a9e6f; color: #fff; }
    .genki-qr:disabled { opacity: 0.4; cursor: not-allowed; }

    #genki-input-area {
      padding: 8px 12px 12px; background: #f7f3ef;
      border-top: 1px solid #b2d8bc; flex-shrink: 0;
    }
    #genki-input-row { display: flex; gap: 8px; align-items: flex-end; }
    #genki-input {
      flex: 1; resize: none; border: 1px solid #b2d8bc; border-radius: 12px;
      padding: 10px 14px; font-size: 14px; color: #3d3530;
      background: #fff; outline: none; min-height: 44px; max-height: 100px;
      overflow-y: auto; line-height: 1.4;
    }
    #genki-input:focus { border-color: #5a9e6f; box-shadow: 0 0 0 2px rgba(90,158,111,0.2); }
    #genki-send-btn {
      width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
      background: #5a9e6f; border: none; color: #fff; font-size: 18px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    #genki-send-btn:hover { background: #3d7a52; }
    #genki-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    #genki-disclaimer { font-size: 10px; color: #6b5f58; text-align: center; margin-top: 6px; }
  `;
  document.head.appendChild(style);

  // ── FAQ データ ────────────────────────────────────────────
  const FAQS = [
    { keywords: ['サービス','内容','どんな','活動','プログラム','一日','流れ'],
      answer: '【デイサービスげんき】\n日中に施設へ通いながら、入浴・食事・レクリエーション・機能訓練などをご利用いただけます。ご自宅からの送迎も行っています。\n📞 0743-23-1515\n\n【希望の家】\n生活支援・介護サービスを提供する施設です。\n📞 0743-57-0018' },
    { keywords: ['希望の家','きぼう'],
      answer: '【希望の家】\n生活支援・介護サービスを提供する施設です。\n\n📍 〒639-1061 奈良県生駒郡安堵町東安堵248-1\n📞 TEL：0743-57-0018\n📠 FAX：0743-57-0017' },
    { keywords: ['料金','費用','いくら','金額','自己負担','介護保険'],
      answer: '料金は介護保険の要介護度・ご利用時間・加算等によって異なります。\n\n介護保険の自己負担（1〜3割）＋食費・おやつ代などの実費が発生します。\n\n具体的な金額はケアマネジャーへご相談いただくか、当施設までお問い合わせください。\n\n📞 **0743-23-1515**\n受付時間：9:00〜17:00（月〜土）' },
    { keywords: ['アクセス','場所','住所','どこ','行き方','地図','駐車場'],
      answer: '【施設所在地】\n\n🌿 デイサービスげんき / Office元気\n〒636-0012 奈良県生駒郡安堵町東安堵248-8\n📞 0743-23-1515\n\n🏠 希望の家\n〒639-1061 奈良県生駒郡安堵町東安堵248-1\n📞 0743-57-0018\n\nお車でのご来訪が便利です。駐車場もご用意しています。' },
    { keywords: ['見学','内覧','体験','訪問','予約','申し込み'],
      answer: '見学・体験利用を随時受け付けております！\n\n①お電話でご連絡\n②ご都合の良い日時を調整\n③スタッフがご案内\n\n見学は無料で、ご家族の方もご一緒にどうぞ。\n\n📞 **0743-23-1515**\n受付時間：9:00〜17:00（月〜土）' },
    { keywords: ['求人','採用','仕事','働く','介護職','パート','正社員','募集'],
      answer: '一緒に働く仲間を募集しています！\n\n【募集職種】\n・介護職員（正社員・パート）\n・介護福祉士、ヘルパー など\n\n詳しい条件・状況はお電話にてご確認ください。\n\n📞 **0743-23-1515**\n受付時間：9:00〜17:00（月〜土）' },
    { keywords: ['電話','連絡','問い合わせ','受付','時間','営業','何時'],
      answer: '📞 電話番号：**0743-23-1515**\n🕐 受付時間：9:00〜17:00（月〜土）\n\n希望の家：0743-57-0018\n\n時間外はお問い合わせフォームよりご連絡ください。' },
    { keywords: ['送迎','迎え','自宅','バス'],
      answer: 'ご自宅から施設への送迎を行っております。\n\n送迎エリアや時間はお住まいの地域によって異なります。\nお気軽にご確認ください。\n\n📞 **0743-23-1515**' },
    { keywords: ['食事','昼食','ごはん','アレルギー','食形態'],
      answer: 'デイサービスでは昼食とおやつをご提供しています。\n\n食事形態（普通食・刻み食・ペースト食など）はお体の状態に合わせて対応いたします。\nアレルギーや食事制限もご相談ください。\n\n📞 **0743-23-1515**' },
    { keywords: ['要介護','要支援','認定','ケアマネ','手続き','申請'],
      answer: 'デイサービスのご利用には介護保険の認定（要支援1〜2、要介護1〜5）が必要です。\n\n①市区町村窓口で「要介護認定」を申請\n②認定後、ケアマネジャーにご相談\n③ケアプランを作成し利用開始\n\n手続きが分からない方もお気軽にご相談ください。\n\n📞 **0743-23-1515**' },
  ];

  const RESTRICTED = ['薬','服薬','投薬','病院','診断','治療','症状','緊急','救急','119','危険','自殺','骨折','出血'];

  const QUICK_REPLIES = [
    { label: 'サービス内容', value: 'サービス内容を教えてください' },
    { label: '料金について', value: '料金を教えてください' },
    { label: 'アクセス・場所', value: '場所とアクセスを教えてください' },
    { label: '見学したい', value: '見学について教えてください' },
    { label: '求人情報', value: '求人情報を教えてください' },
    { label: '電話で問い合わせ', value: '電話番号を教えてください' },
  ];

  function getAnswer(input) {
    if (RESTRICTED.some(k => input.includes(k))) {
      return 'いただいたご質問については、専門スタッフや医療機関へのご確認をお勧めします。\n\nスタッフへのご相談はお電話にてどうぞ。\n📞 0743-23-1515';
    }
    let best = null, bestScore = 0;
    for (const faq of FAQS) {
      let score = 0;
      for (const kw of faq.keywords) {
        if (input.includes(kw)) score += kw.length;
      }
      if (score > bestScore) { bestScore = score; best = faq; }
    }
    if (bestScore >= 2 && best) return best.answer;
    return 'ご質問ありがとうございます。\n詳しくはスタッフが丁寧にご案内いたします。\n\n📞 **0743-23-1515**\n受付時間：9:00〜17:00（月〜土）';
  }

  function parseBold(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }

  // ── DOM構築 ───────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'genki-chat-widget';
  root.innerHTML = `
    <div id="genki-panel" style="display:none">
      <div id="genki-header">
        <div id="genki-header-left">
          <span id="genki-header-icon">🌿</span>
          <div>
            <div id="genki-header-title">げんきグループ AIご案内</div>
            <div id="genki-header-sub">デイサービスげんき</div>
          </div>
        </div>
        <button id="genki-close-btn">×</button>
      </div>
      <a id="genki-phone-bar" href="tel:0743-23-1515">
        📞 <strong>0743-23-1515</strong> <span style="font-size:11px;color:#6b5f58">9:00〜17:00</span>
      </a>
      <div id="genki-messages"></div>
      <div id="genki-typing" style="display:none">
        <div class="genki-avatar">🌿</div>
        <div class="genki-dot-wrap">
          <div class="genki-dot"></div>
          <div class="genki-dot"></div>
          <div class="genki-dot"></div>
        </div>
      </div>
      <div id="genki-quick">
        <p>よくあるご質問</p>
        <div id="genki-quick-btns"></div>
      </div>
      <div id="genki-input-area">
        <div id="genki-input-row">
          <textarea id="genki-input" rows="1" placeholder="ご質問をどうぞ..."></textarea>
          <button id="genki-send-btn">➤</button>
        </div>
        <div id="genki-disclaimer">このAIは一般的なご案内を行います。医療・介護判断はスタッフへご確認ください。</div>
      </div>
    </div>
    <button id="genki-toggle-btn">
      <span id="genki-toggle-icon">🌸</span>
      <div id="genki-toggle-label">AIに聞く<span>なんでもご相談ください</span></div>
      <span id="genki-badge">1</span>
    </button>
  `;
  document.body.appendChild(root);

  // ── 要素取得 ──────────────────────────────────────────────
  const panel    = root.querySelector('#genki-panel');
  const toggleBtn= root.querySelector('#genki-toggle-btn');
  const closeBtn = root.querySelector('#genki-close-btn');
  const messages = root.querySelector('#genki-messages');
  const typing   = root.querySelector('#genki-typing');
  const input    = root.querySelector('#genki-input');
  const sendBtn  = root.querySelector('#genki-send-btn');
  const badge    = root.querySelector('#genki-badge');
  const qrWrap   = root.querySelector('#genki-quick-btns');
  let isLoading  = false;

  // クイック返信ボタン生成
  QUICK_REPLIES.forEach(qr => {
    const btn = document.createElement('button');
    btn.className = 'genki-qr';
    btn.textContent = qr.label;
    btn.onclick = () => send(qr.value);
    qrWrap.appendChild(btn);
  });

  // 初回メッセージ
  addMessage('bot', 'こんにちは。デイサービスげんきのご案内AIです。\nサービス内容・料金・アクセス・見学についてお気軽にご質問ください。');

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = `genki-msg ${role}`;
    div.innerHTML = role === 'bot'
      ? `<div class="genki-avatar">🌿</div><div class="genki-bubble">${parseBold(text)}</div>`
      : `<div class="genki-bubble">${parseBold(text)}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function send(text) {
    const t = (text || input.value).trim();
    if (!t || isLoading) return;
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;
    root.querySelectorAll('.genki-qr').forEach(b => b.disabled = true);

    addMessage('user', t);
    typing.style.display = 'flex';
    messages.scrollTop = messages.scrollHeight;

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const answer = getAnswer(t);
    typing.style.display = 'none';
    addMessage('bot', answer);

    isLoading = false;
    sendBtn.disabled = false;
    root.querySelectorAll('.genki-qr').forEach(b => b.disabled = false);
  }

  function openPanel() {
    panel.style.display = 'flex';
    badge.style.display = 'none';
    toggleBtn.innerHTML = '<span style="color:#fff;font-size:22px;font-weight:bold;padding:4px 6px">✕ 閉じる</span>';
    setTimeout(() => input.focus(), 200);
  }
  function closePanel() {
    panel.style.display = 'none';
    toggleBtn.innerHTML = `
      <span id="genki-toggle-icon">🌸</span>
      <div id="genki-toggle-label">AIに聞く<span>なんでもご相談ください</span></div>
    `;
  }

  toggleBtn.addEventListener('click', () => {
    if (panel.style.display === 'none') openPanel(); else closePanel();
  });

  closeBtn.addEventListener('click', closePanel);

  sendBtn.addEventListener('click', () => send());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
