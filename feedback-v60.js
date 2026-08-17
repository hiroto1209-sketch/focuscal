(() => {
  'use strict';

  const BUILD='60';
  const REPO='hiroto1209-sketch/focuscal';
  const CATEGORIES={
    bug:{label:'🐛 不具合',template:'bug_report.yml',prefix:'[Bug]'},
    idea:{label:'💡 アイデア',template:'feature_request.yml',prefix:'[Idea]'},
    ui:{label:'🎨 UI改善',template:'ui_feedback.yml',prefix:'[UI]'},
    speed:{label:'⚡ 動作・速度',template:'performance_feedback.yml',prefix:'[Performance]'}
  };
  let selected='bug';

  const STYLE=`
  #fc-feedback-btn{position:relative;color:var(--accent2,#a78bfa)}
  #fc-feedback-overlay{display:none;position:fixed;inset:0;z-index:190;background:rgba(5,5,12,.74);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);align-items:flex-end;justify-content:center}
  #fc-feedback-overlay.open{display:flex}
  #fc-feedback-sheet{width:min(720px,100%);max-height:92dvh;background:linear-gradient(180deg,var(--surface,#13131f),var(--bg2,#0d0d16));border:1px solid var(--border2,#2c2c46);border-bottom:0;border-radius:22px 22px 0 0;overflow:hidden;box-shadow:0 -20px 70px rgba(0,0,0,.5);display:flex;flex-direction:column}
  #fc-feedback-head{padding:10px 16px 13px;border-bottom:1px solid var(--border,#22223a);display:flex;align-items:center;gap:12px}
  #fc-feedback-head-main{flex:1}.fc-feedback-title{font-size:.88rem;font-weight:900}.fc-feedback-sub{font-size:.59rem;color:var(--muted,#69698a);margin-top:3px;line-height:1.5}
  #fc-feedback-close{border:0;background:var(--surface2,#191926);color:var(--text,#eeeeff);border-radius:10px;width:36px;height:36px;font-size:1rem}
  #fc-feedback-body{overflow:auto;padding:14px 16px 28px;-webkit-overflow-scrolling:touch}
  .fc-feedback-card{background:rgba(255,255,255,.025);border:1px solid var(--border,#22223a);border-radius:15px;padding:13px;margin-bottom:11px}
  .fc-feedback-label{font-size:.67rem;font-weight:850;margin-bottom:8px;color:var(--text,#eeeeff)}
  .fc-feedback-types{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .fc-feedback-type{border:1px solid var(--border2,#2c2c46);background:var(--surface2,#191926);color:var(--text2,#b0b0cc);border-radius:10px;padding:10px 8px;font-size:.64rem;font-weight:750;text-align:left}
  .fc-feedback-type.active{border-color:var(--accent,#7c5cfc);background:color-mix(in srgb,var(--accent,#7c5cfc) 15%,var(--surface2,#191926));color:#fff}
  .fc-feedback-input,.fc-feedback-textarea,.fc-feedback-select{width:100%;border:1px solid var(--border2,#2c2c46);background:var(--bg2,#0d0d16);color:var(--text,#eeeeff);border-radius:10px;padding:10px 11px;font:inherit;font-size:.68rem;outline:none;user-select:text;-webkit-user-select:text}
  .fc-feedback-textarea{min-height:112px;resize:vertical;line-height:1.65}.fc-feedback-textarea.small{min-height:72px}
  .fc-feedback-input:focus,.fc-feedback-textarea:focus,.fc-feedback-select:focus{border-color:var(--accent,#7c5cfc)}
  .fc-feedback-help{font-size:.55rem;color:var(--muted,#69698a);line-height:1.65;margin-top:7px}
  .fc-feedback-meta{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.52rem;color:#777795;line-height:1.65;word-break:break-word}
  .fc-feedback-actions{display:flex;gap:8px}.fc-feedback-action{flex:1;border:1px solid var(--border2,#2c2c46);background:var(--surface2,#191926);color:var(--text,#eeeeff);border-radius:11px;padding:11px 9px;font-size:.66rem;font-weight:800}.fc-feedback-action.primary{background:linear-gradient(135deg,var(--accent,#7c5cfc),var(--accent2,#a78bfa));border-color:transparent;color:#fff}.fc-feedback-action:disabled{opacity:.45}
  .fc-feedback-status{display:none;margin-bottom:10px;padding:10px 11px;border-radius:10px;font-size:.61rem;line-height:1.55}.fc-feedback-status.show{display:block}.fc-feedback-status.ok{background:rgba(50,200,120,.08);border:1px solid rgba(50,200,120,.25);color:#8fe7b5}.fc-feedback-status.err{background:rgba(240,80,96,.08);border:1px solid rgba(240,80,96,.25);color:#f6a1aa}
  .fc-feedback-privacy{font-size:.54rem;color:#72728f;line-height:1.65;margin-top:10px}
  @media(min-width:700px){#fc-feedback-sheet{margin-bottom:18px;border-bottom:1px solid var(--border2,#2c2c46);border-radius:22px;max-height:86vh}}
  `;

  const HTML=`
  <div id="fc-feedback-overlay" aria-hidden="true">
    <div id="fc-feedback-sheet" role="dialog" aria-modal="true" aria-label="FocusCalへフィードバック">
      <div id="fc-feedback-head">
        <div id="fc-feedback-head-main"><div class="fc-feedback-title">💬 FocusCalをもっと良くする</div><div class="fc-feedback-sub">違和感・不具合・アイデアをその場で開発フィードバックに変えます</div></div>
        <button id="fc-feedback-close" aria-label="閉じる">✕</button>
      </div>
      <div id="fc-feedback-body">
        <div id="fc-feedback-status" class="fc-feedback-status"></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">種類</div><div class="fc-feedback-types">${Object.entries(CATEGORIES).map(([k,v])=>`<button class="fc-feedback-type ${k==='bug'?'active':''}" data-feedback-type="${k}">${v.label}</button>`).join('')}</div></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">一言タイトル</div><input id="fc-feedback-title-input" class="fc-feedback-input" maxlength="100" placeholder="例：予定詳細を開いた時にスクロールできない"></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">何が起きた？ / どうしてほしい？</div><textarea id="fc-feedback-message" class="fc-feedback-textarea" maxlength="4000" placeholder="気づいたことをそのまま書いてください。短くても大丈夫です。"></textarea><div class="fc-feedback-help">不具合なら「何をした → 何が起きた → 本来どうなってほしい」の順だと最速で直せます。</div></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">再現手順・補足（任意）</div><textarea id="fc-feedback-steps" class="fc-feedback-textarea small" maxlength="2000" placeholder="1. ○○を開く\n2. △△を押す\n3. ..."></textarea></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">重要度</div><select id="fc-feedback-severity" class="fc-feedback-select"><option value="normal">通常</option><option value="high">かなり困る</option><option value="critical">使えない / データに影響</option></select></div>
        <div class="fc-feedback-card"><div class="fc-feedback-label">自動添付される環境情報</div><div id="fc-feedback-meta" class="fc-feedback-meta"></div><div class="fc-feedback-help">入力内容とアプリのバージョン・画面サイズ・ブラウザ情報を送ります。予定内容やメモ本文は自動送信しません。</div></div>
        <div class="fc-feedback-actions"><button id="fc-feedback-copy" class="fc-feedback-action">内容をコピー</button><button id="fc-feedback-submit" class="fc-feedback-action primary">フィードバック送信</button></div>
        <div class="fc-feedback-privacy">送信はFirebaseへ匿名ユーザーID付きで保存します。送信できない環境では、同じ内容をGitHub Issueへ送れる画面を開きます。</div>
      </div>
    </div>
  </div>`;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const meta=()=>({
    build:String(window.FOCUSCAL_BOOT_BUILD||BUILD),
    path:location.pathname,
    viewport:`${innerWidth}x${innerHeight}`,
    online:navigator.onLine,
    platform:navigator.platform||'',
    userAgent:navigator.userAgent||'',
    timestamp:new Date().toISOString()
  });
  const showStatus=(msg,kind)=>{const e=document.getElementById('fc-feedback-status');if(!e)return;e.textContent=msg;e.className=`fc-feedback-status show ${kind||''}`};
  const current=()=>({
    category:selected,
    title:(document.getElementById('fc-feedback-title-input')?.value||'').trim(),
    message:(document.getElementById('fc-feedback-message')?.value||'').trim(),
    steps:(document.getElementById('fc-feedback-steps')?.value||'').trim(),
    severity:document.getElementById('fc-feedback-severity')?.value||'normal',
    meta:meta()
  });
  const issueBody=d=>`## 内容\n${d.message||'（未入力）'}\n\n## 再現手順・補足\n${d.steps||'（なし）'}\n\n## 重要度\n${d.severity}\n\n## 環境\n- FocusCal build: ${d.meta.build}\n- Viewport: ${d.meta.viewport}\n- Online: ${d.meta.online}\n- Platform: ${d.meta.platform}\n- User agent: ${d.meta.userAgent}\n- Time: ${d.meta.timestamp}`;
  const issueUrl=d=>{const c=CATEGORIES[d.category]||CATEGORIES.bug;const q=new URLSearchParams({template:c.template,title:`${c.prefix} ${d.title||'FocusCal feedback'}`,body:issueBody(d)});return `https://github.com/${REPO}/issues/new?${q.toString()}`};

  function mount(){
    if(document.getElementById('fc-feedback-overlay'))return;
    const s=document.createElement('style');s.id='fc-feedback-style-v60';s.textContent=STYLE;document.head.appendChild(s);
    document.body.insertAdjacentHTML('beforeend',HTML);
    const settings=document.getElementById('settings-btn');
    const btn=document.createElement('button');btn.id='fc-feedback-btn';btn.className='nav-btn';btn.title='フィードバック';btn.setAttribute('aria-label','FocusCalへフィードバック');btn.textContent='💬';
    if(settings?.parentNode)settings.parentNode.insertBefore(btn,settings);else document.body.appendChild(btn);
    bind();
    const sheet=document.getElementById('fc-feedback-sheet'),head=document.getElementById('fc-feedback-head');
    if(window.FocusCalSheetGestures){const h=window.FocusCalSheetGestures.ensureHandle(sheet,head);window.FocusCalSheetGestures.attach(sheet,h,document.getElementById('fc-feedback-close'))}
  }

  function bind(){
    document.getElementById('fc-feedback-btn').onclick=open;
    document.getElementById('fc-feedback-close').onclick=close;
    document.getElementById('fc-feedback-overlay').addEventListener('click',e=>{if(e.target.id==='fc-feedback-overlay')close()});
    document.getElementById('fc-feedback-body').addEventListener('click',e=>{const b=e.target.closest('[data-feedback-type]');if(!b)return;selected=b.dataset.feedbackType;document.querySelectorAll('.fc-feedback-type').forEach(x=>x.classList.toggle('active',x===b))});
    document.getElementById('fc-feedback-copy').onclick=copy;
    document.getElementById('fc-feedback-submit').onclick=submit;
  }

  function open(){const o=document.getElementById('fc-feedback-overlay');o.classList.add('open');o.setAttribute('aria-hidden','false');document.getElementById('fc-feedback-meta').textContent=Object.entries(meta()).map(([k,v])=>`${k}: ${v}`).join('\n')}
  function close(){const o=document.getElementById('fc-feedback-overlay');o.classList.remove('open');o.setAttribute('aria-hidden','true')}

  async function copy(){const d=current();const text=`${CATEGORIES[d.category].label} ${d.title}\n\n${issueBody(d)}`;try{await navigator.clipboard.writeText(text);showStatus('フィードバック内容をコピーしました。','ok')}catch(_){showStatus('コピーできませんでした。長押しで本文をコピーしてください。','err')}}

  async function firebaseSubmit(d){
    const cfg=window.FOCUSCAL_FIREBASE_CONFIG;if(!cfg)return false;
    try{
      const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,collection,addDoc,serverTimestamp}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const app=getApps().length?getApp():initializeApp(cfg),auth=getAuth(app);if(!auth.currentUser)await signInAnonymously(auth);
      const db=getFirestore(app);await addDoc(collection(db,'feedback'),{authorUid:auth.currentUser.uid,category:d.category,title:d.title,message:d.message,steps:d.steps,severity:d.severity,build:d.meta.build,viewport:d.meta.viewport,platform:d.meta.platform,userAgent:d.meta.userAgent,path:d.meta.path,online:d.meta.online,createdAt:serverTimestamp()});return true;
    }catch(e){console.warn('[FocusCal feedback]',e);return false}
  }

  async function submit(){
    const d=current();if(d.message.length<3){showStatus('内容を3文字以上入力してください。','err');return}
    const b=document.getElementById('fc-feedback-submit');b.disabled=true;b.textContent='送信中…';
    const ok=await firebaseSubmit(d);b.disabled=false;b.textContent='フィードバック送信';
    if(ok){showStatus('送信しました。FocusCalの改善候補として記録されました。ありがとうございます。','ok');document.getElementById('fc-feedback-title-input').value='';document.getElementById('fc-feedback-message').value='';document.getElementById('fc-feedback-steps').value='';return}
    showStatus('Firebaseへ送れなかったため、GitHubの送信画面を開きます。','err');setTimeout(()=>{location.href=issueUrl(d)},450);
  }

  function run(){mount();window.FocusCalFeedback={open,build:BUILD,issueUrl}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
