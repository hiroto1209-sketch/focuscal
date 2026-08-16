(() => {
  'use strict';

  const STYLE = `
  #peek-btn{position:relative;color:var(--accent2,#a78bfa)}
  #peek-btn .peek-badge{position:absolute;right:-3px;top:-4px;min-width:14px;height:14px;padding:0 3px;border-radius:8px;background:#e85070;color:white;font-size:8px;line-height:14px;font-weight:800;display:none}
  #peek-btn.has-badge .peek-badge{display:block}
  #peek-overlay{display:none;position:fixed;inset:0;z-index:186;background:rgba(5,5,12,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);align-items:flex-end;justify-content:center}
  #peek-overlay.open{display:flex}
  #peek-sheet{width:min(720px,100%);max-height:92dvh;background:linear-gradient(180deg,var(--surface,#13131f),var(--bg2,#0d0d16));border:1px solid var(--border2,#2c2c46);border-bottom:0;border-radius:22px 22px 0 0;overflow:hidden;box-shadow:0 -20px 70px rgba(0,0,0,.45);display:flex;flex-direction:column}
  #peek-head{padding:10px 16px 12px;border-bottom:1px solid var(--border,#22223a);flex-shrink:0}
  #peek-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
  #peek-title{font-size:.88rem;font-weight:800;letter-spacing:.04em}.peek-sub{font-size:.61rem;color:var(--muted,#4a4a70);margin-top:3px}
  #peek-close{border:0;background:var(--surface2,#191926);color:var(--text,#eeeeff);border-radius:10px;width:34px;height:34px;font-size:1rem}
  #peek-body{overflow:auto;padding:14px 16px 30px;-webkit-overflow-scrolling:touch}
  .peek-card{background:rgba(255,255,255,.025);border:1px solid var(--border,#22223a);border-radius:15px;padding:13px;margin-bottom:11px}
  .peek-card-title{display:flex;align-items:center;gap:7px;font-size:.73rem;font-weight:800;margin-bottom:9px}.peek-card-title small{font-weight:500;color:var(--muted,#4a4a70);margin-left:auto}
  .peek-me{display:flex;gap:9px;align-items:center}.peek-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,var(--accent,#7c5cfc),var(--accent2,#a78bfa));color:#fff;font-weight:900;flex:none}
  .peek-me-main{min-width:0;flex:1}.peek-name{font-size:.75rem;font-weight:800}.peek-code{font-size:.64rem;color:var(--accent2,#a78bfa);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;margin-top:3px}
  .peek-actions{display:flex;gap:7px;margin-top:10px}.peek-actions>*{flex:1}
  .peek-action{border:1px solid var(--border2,#2c2c46);background:var(--surface2,#191926);color:var(--text,#eeeeff);border-radius:10px;padding:9px 10px;font-size:.66rem;font-weight:700}.peek-action.primary{background:var(--accent,#7c5cfc);border-color:var(--accent,#7c5cfc);color:#fff}.peek-action.danger{color:#ff8898}
  .peek-input-row{display:flex;gap:7px}.peek-input{flex:1;min-width:0;border:1px solid var(--border2,#2c2c46);background:var(--surface2,#191926);color:var(--text,#eeeeff);border-radius:10px;padding:10px 11px;font-size:.72rem;outline:none;text-transform:uppercase;letter-spacing:.06em}
  .peek-input:focus{border-color:var(--accent,#7c5cfc)}
  .peek-person{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid var(--border,#22223a)}.peek-person:first-of-type{border-top:0}.peek-person-main{flex:1;min-width:0}.peek-person-name{font-size:.72rem;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.peek-person-meta{font-size:.59rem;color:var(--muted,#4a4a70);margin-top:2px}.peek-person .peek-action{flex:none;padding:7px 9px}
  .peek-empty{color:var(--muted,#4a4a70);font-size:.65rem;line-height:1.7;padding:5px 0}
  .peek-status{padding:9px 10px;border-radius:10px;font-size:.63rem;line-height:1.55;margin-bottom:10px;background:rgba(124,92,252,.09);border:1px solid rgba(124,92,252,.22)}
  .peek-status.warn{background:rgba(232,160,32,.09);border-color:rgba(232,160,32,.25)}.peek-status.ok{background:rgba(40,184,96,.08);border-color:rgba(40,184,96,.22)}
  #peek-calendar{display:none}#peek-calendar.open{display:block}
  .peek-cal-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}.peek-cal-head .peek-action{flex:none}.peek-cal-title{flex:1;text-align:center;font-size:.77rem;font-weight:900}.peek-live{font-size:.56rem;color:#4ad982;white-space:nowrap}.peek-live::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#4ad982;margin-right:4px;box-shadow:0 0 9px #4ad982}
  .peek-day{border-top:1px solid var(--border,#22223a);padding:10px 0}.peek-day:first-child{border-top:0}.peek-day-date{font-size:.64rem;color:var(--muted,#4a4a70);font-weight:800;margin-bottom:7px}.peek-ev{display:grid;grid-template-columns:7px minmax(0,1fr) auto;gap:8px;align-items:center;padding:7px 8px;border-radius:9px;background:var(--surface2,#191926);margin-bottom:5px}.peek-ev-dot{width:7px;height:7px;border-radius:50%}.peek-ev-title{font-size:.68rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.peek-ev-time{font-size:.57rem;color:var(--muted,#4a4a70)}.peek-ev.done .peek-ev-title{text-decoration:line-through;opacity:.55}.peek-progress{height:5px;background:var(--surface3,#20202f);border-radius:5px;overflow:hidden;margin:8px 0 3px}.peek-progress>i{display:block;height:100%;background:linear-gradient(90deg,var(--accent,#7c5cfc),var(--accent2,#a78bfa));border-radius:inherit}
  .peek-privacy{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.peek-pill{font-size:.55rem;border:1px solid var(--border2,#2c2c46);color:var(--muted,#4a4a70);border-radius:99px;padding:4px 7px}
  @media(min-width:700px){#peek-sheet{margin-bottom:18px;border-bottom:1px solid var(--border2,#2c2c46);border-radius:22px;max-height:86vh}}
  `;

  const HTML = `
  <div id="peek-overlay" aria-hidden="true">
    <div id="peek-sheet" role="dialog" aria-modal="true" aria-label="カレンダーを覗かせて頂く">
      <div id="peek-head"><div id="peek-title-row">
        <div><div id="peek-title">👀 カレンダーを覗かせて頂く</div><div class="peek-sub">承諾した相手の予定と進捗だけをリアルタイムで共有します</div></div>
        <button id="peek-close" aria-label="閉じる">✕</button>
      </div></div>
      <div id="peek-body">
        <div id="peek-home">
          <div id="peek-cloud-status"></div>
          <div class="peek-card"><div class="peek-card-title">あなたの共有ID <small>相手に送る</small></div><div class="peek-me"><div class="peek-avatar" id="peek-avatar">F</div><div class="peek-me-main"><div class="peek-name" id="peek-my-name">FocusCal User</div><div class="peek-code" id="peek-my-code">接続中...</div></div></div><div class="peek-actions"><button class="peek-action" id="peek-name-btn">表示名を変更</button><button class="peek-action primary" id="peek-copy-btn">共有IDをコピー</button></div></div>
          <div class="peek-card"><div class="peek-card-title">覗かせて頂くリクエスト</div><div class="peek-input-row"><input class="peek-input" id="peek-code-input" maxlength="12" placeholder="相手の共有ID"><button class="peek-action primary" id="peek-request-btn">申請</button></div><div class="peek-privacy"><span class="peek-pill">承諾が必要</span><span class="peek-pill">いつでも解除可能</span><span class="peek-pill">予定・完了状況を共有</span></div></div>
          <div class="peek-card"><div class="peek-card-title">届いている申請 <small id="peek-request-count"></small></div><div id="peek-incoming"></div></div>
          <div class="peek-card"><div class="peek-card-title">覗かせて頂いている人 <small>LIVE</small></div><div id="peek-following"></div></div>
          <div class="peek-card"><div class="peek-card-title">あなたのカレンダーを覗ける人 <small>いつでも停止できます</small></div><div id="peek-followers"></div></div>
        </div>
        <div id="peek-calendar"><div class="peek-cal-head"><button class="peek-action" id="peek-cal-back">← 戻る</button><button class="peek-action" id="peek-cal-prev">‹</button><div class="peek-cal-title" id="peek-cal-title"></div><button class="peek-action" id="peek-cal-next">›</button><span class="peek-live">LIVE</span></div><div id="peek-cal-summary"></div><div id="peek-cal-events"></div></div>
      </div>
    </div>
  </div>`;

  const PEEK={db:null,auth:null,uid:null,code:null,ready:false,following:new Map(),followers:new Map(),incoming:new Map(),unsubs:[],calUnsub:null,viewUid:null,viewName:'',viewYear:new Date().getFullYear(),viewMonth:new Date().getMonth(),syncTimers:new Map(),fns:null};
  const DAY_NAMES=['日','月','火','水','木','金','土'];
  const CAT_COLORS={work:'#3070d0',personal:'#8050d0',health:'#40a050',family:'#d07020',study:'#d0a020',other:'#607080'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const config=()=>window.FOCUSCAL_FIREBASE_CONFIG||null;
  const configured=()=>{const c=config();return !!(c&&c.apiKey&&c.projectId&&c.appId)};
  const activeYear=()=>{const y=parseInt(localStorage.getItem('fc_active_year'),10);return y>=2022&&y<=2030?y:new Date().getFullYear()};
  const displayName=()=>localStorage.getItem('fc_peek_name')||'FocusCal User';
  const makeCode=uid=>{let h=2166136261;for(const ch of uid){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return 'FC'+(h>>>0).toString(36).toUpperCase().padStart(7,'0').slice(0,7)};
  const permId=(owner,viewer)=>`${owner}_${viewer}`;
  const eventDocId=(uid,y,m)=>`${uid}_${y}_${m}`;
  const toast=msg=>{try{if(typeof showUndoToast==='function'){showUndoToast(msg);return}}catch(_){} console.log('[FocusCal]',msg)};
  const status=(html,kind='')=>{const el=document.getElementById('peek-cloud-status');if(el)el.innerHTML=`<div class="peek-status ${kind}">${html}</div>`};

  function mount(){
    if(document.getElementById('peek-overlay'))return;
    const st=document.createElement('style');st.id='peek-style';st.textContent=STYLE;document.head.appendChild(st);
    document.body.insertAdjacentHTML('beforeend',HTML);
    const settings=document.getElementById('settings-btn');
    const btn=document.createElement('button');btn.className='nav-btn';btn.id='peek-btn';btn.title='カレンダーを覗かせて頂く';btn.setAttribute('aria-label','カレンダーを覗かせて頂く');btn.innerHTML='<span style="font-size:14px">👀</span><span class="peek-badge" id="peek-badge">0</span>';
    if(settings?.parentNode)settings.parentNode.insertBefore(btn,settings); else document.body.appendChild(btn);
    bindUI();renderIdentity();renderLists();
    if(configured())setTimeout(loadFirebase,150);
  }

  function bindUI(){
    const overlay=document.getElementById('peek-overlay');
    document.getElementById('peek-btn').onclick=openPeek;
    document.getElementById('peek-close').onclick=closePeek;
    overlay.addEventListener('click',e=>{if(e.target===overlay)closePeek()});
    document.getElementById('peek-request-btn').onclick=requestByCode;
    document.getElementById('peek-code-input').addEventListener('keydown',e=>{if(e.key==='Enter')requestByCode()});
    document.getElementById('peek-copy-btn').onclick=copyCode;
    document.getElementById('peek-name-btn').onclick=changeName;
    document.getElementById('peek-body').addEventListener('click',e=>{const a=e.target.closest('[data-peek-accept]'),d=e.target.closest('[data-peek-deny]'),o=e.target.closest('[data-peek-open]'),u=e.target.closest('[data-peek-unfollow]'),r=e.target.closest('[data-peek-remove]');if(a)acceptRequest(a.dataset.peekAccept);else if(d)denyRequest(d.dataset.peekDeny);else if(u)disconnect(u.dataset.peekUnfollow,'following');else if(r)disconnect(r.dataset.peekRemove,'followers');else if(o)openCalendar(o.dataset.peekOpen)});
    document.getElementById('peek-cal-back').onclick=closeCalendar;
    document.getElementById('peek-cal-prev').onclick=()=>{PEEK.viewMonth--;if(PEEK.viewMonth<0){PEEK.viewMonth=11;PEEK.viewYear--}subscribeCalendar()};
    document.getElementById('peek-cal-next').onclick=()=>{PEEK.viewMonth++;if(PEEK.viewMonth>11){PEEK.viewMonth=0;PEEK.viewYear++}subscribeCalendar()};
  }

  async function loadFirebase(){
    if(PEEK.ready)return true;
    if(!configured()){status('☁️ Firebase設定が見つかりません。','warn');return false}
    try{
      const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,doc,setDoc,getDoc,deleteDoc,collection,onSnapshot,serverTimestamp,writeBatch,query,where}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const app=getApps().length?getApp():initializeApp(config());
      PEEK.auth=getAuth(app);PEEK.db=getFirestore(app);PEEK.fns={doc,setDoc,getDoc,deleteDoc,collection,onSnapshot,serverTimestamp,writeBatch,query,where};
      if(!PEEK.auth.currentUser)await signInAnonymously(PEEK.auth);
      PEEK.uid=PEEK.auth.currentUser.uid;PEEK.code=makeCode(PEEK.uid);
      await setDoc(doc(PEEK.db,'users',PEEK.uid),{displayName:displayName(),code:PEEK.code,updatedAt:serverTimestamp()},{merge:true});
      await setDoc(doc(PEEK.db,'shareCodes',PEEK.code),{uid:PEEK.uid,createdAt:serverTimestamp()},{merge:false});
      PEEK.ready=true;status('🟢 <b>リアルタイム共有に接続済み</b> — 承諾した相手だけが閲覧できます。','ok');renderIdentity();bindRealtime();syncAllMonths();return true;
    }catch(e){console.error('FocusCal Firebase:',e);status('Firebase接続に失敗しました。Authentication・Firestore・ルールを確認してください。','warn');return false}
  }

  function clearSubs(){PEEK.unsubs.splice(0).forEach(fn=>{try{fn()}catch(_){}});if(PEEK.calUnsub){try{PEEK.calUnsub()}catch(_){}PEEK.calUnsub=null}}
  function bindRealtime(){
    clearSubs();const {collection,onSnapshot,query,where}=PEEK.fns;
    PEEK.unsubs.push(onSnapshot(query(collection(PEEK.db,'peekRequests'),where('ownerUid','==',PEEK.uid)),snap=>{PEEK.incoming.clear();for(const d of snap.docs){const x=d.data();if(x.status==='pending')PEEK.incoming.set(d.id,x)}renderLists()},e=>console.warn('incoming',e)));
    PEEK.unsubs.push(onSnapshot(query(collection(PEEK.db,'peekPermissions'),where('viewerUid','==',PEEK.uid)),snap=>{PEEK.following.clear();for(const d of snap.docs){const x=d.data();if(x.active===true)PEEK.following.set(x.ownerUid,{...x,permissionId:d.id})}renderLists()},e=>console.warn('following',e)));
    PEEK.unsubs.push(onSnapshot(query(collection(PEEK.db,'peekPermissions'),where('ownerUid','==',PEEK.uid)),snap=>{PEEK.followers.clear();for(const d of snap.docs){const x=d.data();if(x.active===true)PEEK.followers.set(x.viewerUid,{...x,permissionId:d.id})}renderLists()},e=>console.warn('followers',e)));
  }

  function renderIdentity(){const n=displayName();const name=document.getElementById('peek-my-name');if(name)name.textContent=n;const code=document.getElementById('peek-my-code');if(code)code.textContent=PEEK.code||'接続中...';const av=document.getElementById('peek-avatar');if(av)av.textContent=(n.trim()[0]||'F').toUpperCase()}
  function personRow(id,p,type){
    if(type==='incoming'){const n=esc(p.requesterName||'FocusCal User');return `<div class="peek-person"><div class="peek-avatar">${n[0]||'F'}</div><div class="peek-person-main"><div class="peek-person-name">${n}</div><div class="peek-person-meta">「カレンダーを覗かせて頂く」を申請中</div></div><button class="peek-action primary" data-peek-accept="${id}">承諾</button><button class="peek-action" data-peek-deny="${id}">拒否</button></div>`}
    if(type==='following'){const n=esc(p.ownerName||'FocusCal User');return `<div class="peek-person"><div class="peek-avatar">${n[0]||'F'}</div><div class="peek-person-main"><div class="peek-person-name">👀 ${n}</div><div class="peek-person-meta">カレンダーを覗かせて頂いています</div></div><button class="peek-action primary" data-peek-open="${id}">覗く</button><button class="peek-action" data-peek-unfollow="${id}">解除</button></div>`}
    const n=esc(p.viewerName||'FocusCal User');return `<div class="peek-person"><div class="peek-avatar">${n[0]||'F'}</div><div class="peek-person-main"><div class="peek-person-name">${n}</div><div class="peek-person-meta">あなたの予定を閲覧できます</div></div><button class="peek-action danger" data-peek-remove="${id}">停止</button></div>`;
  }
  function renderLists(){
    const inc=document.getElementById('peek-incoming'),fol=document.getElementById('peek-following'),fr=document.getElementById('peek-followers');if(!inc||!fol||!fr)return;
    inc.innerHTML=PEEK.incoming.size?[...PEEK.incoming].map(([id,p])=>personRow(id,p,'incoming')).join(''):'<div class="peek-empty">新しい申請はありません。</div>';
    fol.innerHTML=PEEK.following.size?[...PEEK.following].map(([id,p])=>personRow(id,p,'following')).join(''):'<div class="peek-empty">まだ誰のカレンダーも覗いていません。共有IDから申請できます。</div>';
    fr.innerHTML=PEEK.followers.size?[...PEEK.followers].map(([id,p])=>personRow(id,p,'followers')).join(''):'<div class="peek-empty">あなたのカレンダーを覗ける人はいません。</div>';
    const count=PEEK.incoming.size;document.getElementById('peek-request-count').textContent=count?`${count}件`:'';const b=document.getElementById('peek-btn'),badge=document.getElementById('peek-badge');if(b&&badge){badge.textContent=count;b.classList.toggle('has-badge',count>0)}
  }

  async function requestByCode(){
    if(!(await loadFirebase()))return;const code=document.getElementById('peek-code-input').value.trim().toUpperCase();if(!code)return;if(code===PEEK.code){toast('自分自身には申請できません');return}
    try{const {doc,getDoc,setDoc,collection,serverTimestamp}=PEEK.fns;const hit=await getDoc(doc(PEEK.db,'shareCodes',code));if(!hit.exists()){toast('共有IDが見つかりません');return}const target=hit.data().uid;const ref=doc(collection(PEEK.db,'peekRequests'));await setDoc(ref,{requesterUid:PEEK.uid,ownerUid:target,status:'pending',requesterName:displayName(),requestedAt:serverTimestamp()});document.getElementById('peek-code-input').value='';toast('「カレンダーを覗かせて頂く」を申請しました')}catch(e){console.error(e);toast('申請に失敗しました')}
  }
  async function acceptRequest(id){
    try{const req=PEEK.incoming.get(id);if(!req)return;const {doc,writeBatch,serverTimestamp}=PEEK.fns;const b=writeBatch(PEEK.db);b.set(doc(PEEK.db,'peekPermissions',permId(PEEK.uid,req.requesterUid)),{ownerUid:PEEK.uid,viewerUid:req.requesterUid,active:true,ownerName:displayName(),viewerName:req.requesterName||'FocusCal User',since:serverTimestamp()});b.delete(doc(PEEK.db,'peekRequests',id));await b.commit();syncAllMonths();toast('カレンダーを覗かせて頂けるようにしました')}catch(e){console.error(e);toast('承諾に失敗しました')}
  }
  async function denyRequest(id){try{await PEEK.fns.deleteDoc(PEEK.fns.doc(PEEK.db,'peekRequests',id));toast('申請を拒否しました')}catch(e){console.error(e);toast('拒否に失敗しました')}}
  async function disconnect(uid,mode){try{const owner=mode==='following'?uid:PEEK.uid,viewer=mode==='following'?PEEK.uid:uid;await PEEK.fns.deleteDoc(PEEK.fns.doc(PEEK.db,'peekPermissions',permId(owner,viewer)));toast('閲覧許可を解除しました')}catch(e){console.error(e);toast('解除に失敗しました')}}

  function publicMonth(data){const out={};for(const day of Object.keys(data||{})){const dd=data[day];if(!dd||!Array.isArray(dd.events))continue;const events=dd.events.filter(e=>e.peekVisibility!=='private').map(e=>({title:e.peekVisibility==='busy'?'予定あり':String(e.title||''),cat:e.cat||'other',allday:!!e.allday,start:e.start||'',end:e.end||'',done:!!e.done,visibility:e.peekVisibility||'full'}));if(events.length)out[day]={events}}return out}
  function loadMonth(y,m){try{return JSON.parse(localStorage.getItem(`fc_${y}_${m}`))||{}}catch(_){return{}}}
  async function syncMonth(y,m,data){if(!PEEK.ready)return;try{const {doc,setDoc,serverTimestamp}=PEEK.fns;await setDoc(doc(PEEK.db,'events',eventDocId(PEEK.uid,y,m)),{ownerUid:PEEK.uid,year:y,month:m,days:publicMonth(data??loadMonth(y,m)),updatedAt:serverTimestamp()},{merge:false})}catch(e){console.warn('FocusCal sync:',e)}}
  function queueSync(y,m,data){if(!PEEK.ready)return;const key=`${y}-${m}`;clearTimeout(PEEK.syncTimers.get(key));PEEK.syncTimers.set(key,setTimeout(()=>syncMonth(y,m,data),350))}
  function syncAllMonths(){if(!PEEK.ready)return;const y=activeYear();for(let m=0;m<12;m++)syncMonth(y,m,loadMonth(y,m))}

  function openCalendar(uid){const p=PEEK.following.get(uid)||{};PEEK.viewUid=uid;PEEK.viewName=p.ownerName||'FocusCal User';PEEK.viewYear=activeYear();PEEK.viewMonth=new Date().getMonth();document.getElementById('peek-home').style.display='none';document.getElementById('peek-calendar').classList.add('open');subscribeCalendar()}
  function subscribeCalendar(){if(PEEK.calUnsub){try{PEEK.calUnsub()}catch(_){}}document.getElementById('peek-cal-title').textContent=`${PEEK.viewName}・${PEEK.viewYear}年${PEEK.viewMonth+1}月`;const ref=PEEK.fns.doc(PEEK.db,'events',eventDocId(PEEK.viewUid,PEEK.viewYear,PEEK.viewMonth));PEEK.calUnsub=PEEK.fns.onSnapshot(ref,s=>renderCalendar(s.exists()?s.data().days:{}),e=>{console.error(e);renderCalendar({});toast('閲覧権限または通信状態を確認してください')})}
  function renderCalendar(days){let total=0,done=0;const chunks=[];for(const day of Object.keys(days||{}).map(Number).sort((a,b)=>a-b)){const evs=days[day]?.events||[];if(!evs.length)continue;total+=evs.length;done+=evs.filter(e=>e.done).length;const dw=DAY_NAMES[new Date(PEEK.viewYear,PEEK.viewMonth,day).getDay()];chunks.push(`<div class="peek-day"><div class="peek-day-date">${PEEK.viewMonth+1}/${day}（${dw}）</div>${evs.map(e=>`<div class="peek-ev ${e.done?'done':''}"><span class="peek-ev-dot" style="background:${CAT_COLORS[e.cat]||CAT_COLORS.other}"></span><span class="peek-ev-title">${esc(e.title)}</span><span class="peek-ev-time">${esc(e.allday?'終日':e.start||'')}${e.done?' ✓':''}</span></div>`).join('')}</div>`)}const pct=total?Math.round(done/total*100):0;document.getElementById('peek-cal-summary').innerHTML=`<div class="peek-card"><div class="peek-card-title">今月の進捗 <small>${done}/${total} 完了</small></div><div class="peek-progress"><i style="width:${pct}%"></i></div><div class="peek-person-meta">達成率 ${pct}% ・予定変更はリアルタイム反映</div></div>`;document.getElementById('peek-cal-events').innerHTML=chunks.join('')||'<div class="peek-card"><div class="peek-empty">この月に共有されている予定はありません。</div></div>'}
  function closeCalendar(){if(PEEK.calUnsub){try{PEEK.calUnsub()}catch(_){}PEEK.calUnsub=null}PEEK.viewUid=null;document.getElementById('peek-calendar').classList.remove('open');document.getElementById('peek-home').style.display='block'}
  function openPeek(){const o=document.getElementById('peek-overlay');o.classList.add('open');o.setAttribute('aria-hidden','false');renderIdentity();renderLists();loadFirebase()}
  function closePeek(){closeCalendar();const o=document.getElementById('peek-overlay');o.classList.remove('open');o.setAttribute('aria-hidden','true')}
  async function copyCode(){if(!(await loadFirebase()))return;try{await navigator.clipboard.writeText(PEEK.code);toast('共有IDをコピーしました')}catch(_){prompt('共有ID',PEEK.code)}}
  async function changeName(){const n=prompt('相手に表示する名前',displayName());if(!n?.trim())return;const name=n.trim().slice(0,30);localStorage.setItem('fc_peek_name',name);renderIdentity();if(!PEEK.ready)return;try{const {doc,setDoc,serverTimestamp}=PEEK.fns;await setDoc(doc(PEEK.db,'users',PEEK.uid),{displayName:name,code:PEEK.code,updatedAt:serverTimestamp()},{merge:true});for(const [viewer,p] of PEEK.followers){await setDoc(doc(PEEK.db,'peekPermissions',permId(PEEK.uid,viewer)),{ownerUid:PEEK.uid,viewerUid:viewer,active:true,ownerName:name,viewerName:p.viewerName||'FocusCal User',since:p.since||serverTimestamp()},{merge:true})}}catch(e){console.warn(e)}}

  const nativeSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){nativeSetItem.call(this,key,value);try{const m=/^fc_(\d{4})_(\d{1,2})$/.exec(String(key));if(m&&PEEK.ready){const y=Number(m[1]),mo=Number(m[2]);queueSync(y,mo,JSON.parse(value))}}catch(_){}};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
