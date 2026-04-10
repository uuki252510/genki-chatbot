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
    #genki-toggle-icon { width: 40px; height: 40px; object-fit: contain; }
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

  // クイック返信ボタン（APIと同期）
  const QUICK_REPLIES = [
    { label: 'サービス内容', value: 'デイサービスのサービス内容を教えてください' },
    { label: '料金について', value: '料金を教えてください' },
    { label: 'アクセス・場所', value: '場所とアクセスを教えてください' },
    { label: '見学したい', value: '見学について教えてください' },
    { label: '希望の家', value: '希望の家について教えてください' },
    { label: '求人情報', value: '求人情報を教えてください' },
  ];

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
      <img id="genki-toggle-icon" src="https://genki-chatbot.vercel.app/flower.png" alt="花アイコン">
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

    try {
      const res = await fetch('https://genki-chatbot.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t }),
      });
      const data = await res.json();
      typing.style.display = 'none';
      addMessage('bot', data.answer || 'もう一度お試しください。');
    } catch (e) {
      typing.style.display = 'none';
      addMessage('bot', '通信エラーが発生しました。\nお電話（0743-23-1515）にてお問い合わせください。');
    }

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
      <img id="genki-toggle-icon" src="https://genki-chatbot.vercel.app/flower.png" alt="花アイコン">
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
