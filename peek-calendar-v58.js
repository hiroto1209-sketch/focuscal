(() => {
  'use strict';

  const BUILD='58';
  const STATE={uid:null,db:null,auth:null,fns:null,viewUid:null,viewName:'FocusCal User',year:new Date().getFullYear(),month:new Date().getMonth(),unsub:null,days:{},appearance:{},syncTimer:null};
  const DAY_NAMES=['日','月','火','水','木','金','土'];
  const CAT={work:['#3070d0','仕事'],personal:['#8050d0','個人'],health:['#40a050','健康'],family:['#d07020','家族'],study:['#d0a020','学習'],other:['#607080','その他']};
  const THEMES={
    violet:{a:'#7c5cfc',a2:'#a78bfa'},cyan:{a:'#20a8d8',a2:'#64dcff'},green:{a:'#28a860',a2:'#42d984'},gold:{a:'#d09020',a2:'#f0c040'},red:{a:'#d84050',a2:'#ff7888'},pink:{a:'#d83888',a2:'#ff72bd'},blue:{a:'#3570d8',a2:'#70a7ff'},mono:{a:'#9292a8',a2:'#d2d2df'},galaxy:{a:'#9858ff',a2:'#58c8ff'},sakura:{a:'#e97aaa',a2:'#ffc0d8'},ocean:{a:'#1888c8',a2:'#50d8f0'},ember:{a:'#e06020',a2:'#ffb050'},matrix:{a:'#28b860',a2:'#40ff88'}
  };
  const BGS={
    default:{bg:'#09090f',bg2:'#0d0d16',surface:'#13131f',surface2:'#191926',border:'#22223a'},
    plum:{bg:'#100811',bg2:'#160c18',surface:'#211323',surface2:'#2a192d',border:'#35203a'},
    navy:{bg:'#070b14',bg2:'#0b101b',surface:'#111827',surface2:'#182235',border:'#24324a'},
    forest:{bg:'#07100b',bg2:'#0b1610',surface:'#112018',surface2:'#182a20',border:'#24382c'},
    sand:{bg:'#0e0c08',bg2:'#14110c',surface:'#1e1a12',surface2:'#262118',border:'#342d20'},
    slate:{bg:'#0b0d10',bg2:'#101318',surface:'#171b22',surface2:'#1e232c',border:'#28303c'},
    teal:{bg:'#040f12',bg2:'#06161a',surface:'#0a1f26',surface2:'#0f2830',border:'#183842'}
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const eventDocId=(uid,y,m)=>`${uid}_${y}_${m}`;

  const STYLE=`
    #peek-calendar.fc-mirror-mode{min-height:58vh}
    #peek-calendar.fc-mirror-mode .peek-cal-head{margin-bottom:10px}
    #peek-calendar.fc-mirror-mode #peek-cal-summary{display:none!important}
    #peek-calendar.fc-mirror-mode #peek-cal-events{position:relative}
    .fc-mirror{--pm-a:#7c5cfc;--pm-a2:#a78bfa;--pm-bg:#09090f;--pm-bg2:#0d0d16;--pm-surface:#13131f;--pm-surface2:#191926;--pm-border:#22223a;position:relative;isolation:isolate;overflow:hidden;border:1px solid var(--pm-border);border-radius:18px;background:linear-gradient(180deg,var(--pm-bg),var(--pm-bg2));min-height:520px;color:#eeeeff;box-shadow:0 18px 45px rgba(0,0,0,.22)}
    .fc-mirror-fx{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
    .fc-mirror-blob{position:absolute;width:70%;aspect-ratio:1;border-radius:50%;filter:blur(52px);opacity:.28;animation:fcMirrorFloat 15s ease-in-out infinite alternate}
    .fc-mirror-blob.b1{left:-28%;top:-18%;background:var(--pm-a)}.fc-mirror-blob.b2{right:-30%;bottom:-24%;background:var(--pm-a2);animation-duration:19s}.fc-mirror-blob.b3{left:28%;top:35%;width:44%;background:var(--pm-a2);opacity:.12;animation-duration:23s}
    @keyframes fcMirrorFloat{to{transform:translate(18px,26px) scale(1.14) rotate(12deg)}}
    .fc-mirror-stars{position:absolute;inset:0;background-image:radial-gradient(circle at 14% 18%,rgba(255,255,255,.8) 0 1px,transparent 1.7px),radial-gradient(circle at 68% 12%,rgba(255,255,255,.7) 0 1px,transparent 1.6px),radial-gradient(circle at 83% 31%,rgba(255,255,255,.52) 0 1px,transparent 1.5px),radial-gradient(circle at 31% 44%,rgba(255,255,255,.55) 0 1px,transparent 1.5px),radial-gradient(circle at 72% 65%,rgba(255,255,255,.62) 0 1px,transparent 1.5px),radial-gradient(circle at 18% 78%,rgba(255,255,255,.6) 0 1px,transparent 1.5px);background-size:190px 160px;opacity:.44;animation:fcStars 18s linear infinite}
    @keyframes fcStars{to{background-position:28px 40px}}
    .fc-mirror.matrix .fc-mirror-blob,.fc-mirror.matrix .fc-mirror-stars{display:none}.fc-mirror.matrix:after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(180deg,transparent 0 2px,rgba(0,0,0,.18) 3px 4px)}
    .fc-mirror:not(.ambient) .fc-mirror-blob,.fc-mirror:not(.ambient) .fc-mirror-stars{display:none}
    .fc-mirror-inner{position:relative;z-index:2;padding:14px 12px 18px}
    .fc-mirror-month{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:1px 2px 12px}.fc-mirror-month-title{font-size:1.03rem;font-weight:800;letter-spacing:.06em;background:linear-gradient(100deg,var(--pm-a),var(--pm-a2),#fff,var(--pm-a));background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fcMirrorTitle 8s linear infinite}.fc-mirror-owner{font-size:.58rem;color:rgba(210,210,240,.55)}@keyframes fcMirrorTitle{to{background-position:260% 0}}
    .fc-mirror-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:5px}.fc-mirror-week span{text-align:center;font-size:.54rem;color:#777796;font-weight:700;padding:2px 0}.fc-mirror-week span:first-child{color:#d96f7f}.fc-mirror-week span:last-child{color:#5da8ea}
    .fc-mirror-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
    .fc-mirror-day{position:relative;min-height:68px;border:1px solid rgba(120,120,160,.14);border-radius:12px;background:color-mix(in srgb,var(--pm-surface) 84%,transparent);padding:7px 6px 6px;overflow:hidden;transition:transform .12s,border-color .15s,background .15s}.fc-mirror-day.empty{background:transparent;border-color:transparent}.fc-mirror-day.has-events{cursor:pointer}.fc-mirror-day.has-events:active{transform:scale(.95);border-color:var(--pm-a)}
    .fc-mirror-day.today{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--pm-a) 70%,transparent)}
    .fc-mirror-date{font-size:.72rem;font-weight:700;color:#b9b9ce;line-height:1}.fc-mirror-day.sun .fc-mirror-date{color:#e27486}.fc-mirror-day.sat .fc-mirror-date{color:#62afe9}.fc-mirror-day.holiday .fc-mirror-date{color:#d88798}
    .fc-mirror-holiday{position:absolute;right:5px;top:5px;font-size:6px;font-weight:900;width:11px;height:11px;border-radius:50%;display:grid;place-items:center;color:#df8295;border:1px solid rgba(220,112,132,.25);background:rgba(220,112,132,.08)}
    .fc-mirror-dots{display:flex;gap:3px;flex-wrap:wrap;margin-top:8px}.fc-mirror-dot{width:5px;height:5px;border-radius:50%;box-shadow:0 0 5px color-mix(in srgb,currentColor 55%,transparent)}
    .fc-mirror-pill{margin-top:5px;padding:3px 4px;border-radius:5px;background:rgba(255,255,255,.045);font-size:.45rem;color:#9c9cb9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fc-mirror-more{font-size:.42rem;color:var(--pm-a2);margin-top:3px}
    .fc-mirror-day-detail{display:none;position:absolute;inset:0;z-index:5;background:color-mix(in srgb,var(--pm-bg) 91%,transparent);backdrop-filter:blur(13px);-webkit-backdrop-filter:blur(13px);padding:13px;overflow:auto}.fc-mirror-day-detail.open{display:block;animation:fcDetailIn .18s ease-out}@keyframes fcDetailIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .fc-detail-head{display:flex;align-items:center;gap:9px;margin-bottom:14px;position:sticky;top:-13px;padding:12px 0 8px;background:linear-gradient(180deg,var(--pm-bg) 75%,transparent);z-index:3}.fc-detail-back{width:34px;height:34px;border:1px solid var(--pm-border);border-radius:10px;background:var(--pm-surface2);color:#eeeeff}.fc-detail-date{flex:1;font-size:.85rem;font-weight:850}.fc-detail-holiday{font-size:.56rem;color:#d88798;margin-top:2px}.fc-detail-live{font-size:.52rem;color:#42d984}
    .fc-detail-event{border:1px solid var(--pm-border);border-radius:13px;background:color-mix(in srgb,var(--pm-surface) 90%,transparent);padding:11px;margin-bottom:9px}.fc-detail-line{display:flex;align-items:center;gap:7px}.fc-detail-cat{width:8px;height:8px;border-radius:50%;flex:none}.fc-detail-title{font-size:.75rem;font-weight:800;flex:1}.fc-detail-time{font-size:.59rem;color:#8a8aa7;margin-top:6px}.fc-detail-memo{font-size:.63rem;color:#b5b5cf;line-height:1.65;margin-top:8px;padding-top:8px;border-top:1px solid var(--pm-border);white-space:pre-wrap}.fc-detail-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.fc-detail-chip{font-size:.5rem;color:#81819f;border:1px solid var(--pm-border);border-radius:99px;padding:3px 6px}.fc-detail-done{opacity:.55}.fc-detail-done .fc-detail-title{text-decoration:line-through}
    .fc-mirror-empty{padding:38px 16px;text-align:center;color:#72728e;font-size:.68rem;line-height:1.7}
    @media(max-width:390px){.fc-mirror-day{min-height:61px;padding:6px 4px}.fc-mirror-grid{gap:4px}.fc-mirror-pill{font-size:.41rem}}
    @media(prefers-reduced-motion:reduce){.fc-mirror-blob,.fc-mirror-stars,.fc-mirror-month-title{animation:none!important}}
  `;

  function injectStyle(){if(document.getElementById('fc-peek-calendar-v58'))return;const s=document.createElement('style');s.id='fc-peek-calendar-v58';s.textContent=STYLE;document.head.appendChild(s)}

  async function firebase(){
    if(STATE.db&&STATE.auth?.currentUser)return true;
    const cfg=window.FOCUSCAL_FIREBASE_CONFIG;if(!cfg)return false;
    try{
      const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,doc,setDoc,onSnapshot,serverTimestamp}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const app=getApps().length?getApp():initializeApp(cfg);STATE.auth=getAuth(app);STATE.db=getFirestore(app);STATE.fns={doc,setDoc,onSnapshot,serverTimestamp};if(!STATE.auth.currentUser)await signInAnonymously(STATE.auth);STATE.uid=STATE.auth.currentUser.uid;return true;
    }catch(e){console.warn('[Peek mirror] Firebase',e);return false}
  }

  function readSettings(){try{return JSON.parse(localStorage.getItem('fc_settings'))||{}}catch(_){return{}}}
  function appearance(){const s=readSettings();return{theme:s.theme||'violet',bgTint:s.bgTint||'default',weekStart:Number(s.weekStart)||0,holidaysEnabled:localStorage.getItem('fc_holidays_enabled')!=='0'}}
  function richMonth(y,m){
    let raw={};try{raw=JSON.parse(localStorage.getItem(`fc_${y}_${m}`))||{}}catch(_){ }
    const out={};for(const [day,dd] of Object.entries(raw)){if(!dd||!Array.isArray(dd.events))continue;const events=dd.events.filter(e=>e.peekVisibility!=='private').map(e=>{
      const busy=e.peekVisibility==='busy';return{title:busy?'予定あり':String(e.title||''),memo:busy?'':String(e.memo||''),cat:busy?'other':(e.cat||'other'),pri:busy?'':(e.pri||'med'),allday:!!e.allday,start:busy?'':(e.start||''),end:busy?'':(e.end||''),done:!!e.done,visibility:e.peekVisibility||'full'}
    });if(events.length)out[day]={color:dd.color||null,events}}
    return out;
  }
  async function publishMonth(y,m){if(!(await firebase()))return;const key=`fc_${y}_${m}`;if(localStorage.getItem(key)==null)return;try{const {doc,setDoc,serverTimestamp}=STATE.fns;await setDoc(doc(STATE.db,'events',eventDocId(STATE.uid,y,m)),{richDays:richMonth(y,m),appearance:appearance(),mirrorBuild:BUILD,mirrorUpdatedAt:serverTimestamp()},{merge:true})}catch(e){console.warn('[Peek mirror] publish',e)}}
  async function publishExisting(){if(!(await firebase()))return;const y=Number(localStorage.getItem('fc_active_year'))||new Date().getFullYear();for(let m=0;m<12;m++){if(localStorage.getItem(`fc_${y}_${m}`)!=null)publishMonth(y,m)}}
  function schedulePublish(y,m){clearTimeout(STATE.syncTimer);STATE.syncTimer=setTimeout(()=>publishMonth(y,m),720)}
  function hookStorage(){if(Storage.prototype.setItem.__fcMirror58)return;const prev=Storage.prototype.setItem;const wrapped=function(k,v){const r=prev.call(this,k,v);try{const mm=/^fc_(\d{4})_(\d{1,2})$/.exec(String(k));if(mm)schedulePublish(Number(mm[1]),Number(mm[2]));else if(k==='fc_settings'||k==='fc_holidays_enabled'){const y=Number(localStorage.getItem('fc_active_year'))||new Date().getFullYear();for(let m=0;m<12;m++)if(localStorage.getItem(`fc_${y}_${m}`)!=null)schedulePublish(y,m)}}catch(_){ }return r};wrapped.__fcMirror58=true;Storage.prototype.setItem=wrapped}

  function themeVars(a){const t=THEMES[a?.theme]||THEMES.violet,b=BGS[a?.bgTint]||BGS.default;return{...t,...b}}
  function holiday(y,m,d,a){if(a?.holidaysEnabled===false)return null;try{return window.FocusCalHolidays?.get?.(y,m,d)||null}catch(_){return null}}
  function monthStart(a){return a?.weekStart===1?1:0}
  function orderedWeek(start){return start===1?['月','火','水','木','金','土','日']:['日','月','火','水','木','金','土']}
  function dayClass(date){const w=date.getDay();return w===0?'sun':w===6?'sat':''}

  function renderMirror(){
    const host=document.getElementById('peek-cal-events');if(!host)return;const a=STATE.appearance||{},v=themeVars(a),start=monthStart(a),first=new Date(STATE.year,STATE.month,1),last=new Date(STATE.year,STATE.month+1,0).getDate();let offset=(first.getDay()-start+7)%7;const cells=[];
    for(let i=0;i<offset;i++)cells.push('<div class="fc-mirror-day empty"></div>');
    const now=new Date();
    for(let d=1;d<=last;d++){
      const date=new Date(STATE.year,STATE.month,d),dd=STATE.days?.[d]||{},evs=dd.events||[],h=holiday(STATE.year,STATE.month,d,a),today=now.getFullYear()===STATE.year&&now.getMonth()===STATE.month&&now.getDate()===d;const dots=evs.slice(0,4).map(e=>`<span class="fc-mirror-dot" style="background:${CAT[e.cat]?.[0]||CAT.other[0]};color:${CAT[e.cat]?.[0]||CAT.other[0]}"></span>`).join('');const pill=evs[0]?`<div class="fc-mirror-pill">${esc(evs[0].title)}</div>`:'';const more=evs.length>1?`<div class="fc-mirror-more">+${evs.length-1}</div>`:'';
      cells.push(`<button type="button" class="fc-mirror-day ${dayClass(date)} ${evs.length?'has-events':''} ${today?'today':''} ${h?'holiday':''}" data-mirror-day="${d}" ${evs.length?'':'disabled'} style="${dd.color?`box-shadow:inset 0 0 0 1px ${esc(dd.color)}55`:''}"><span class="fc-mirror-date">${d}</span>${h?'<span class="fc-mirror-holiday">祝</span>':''}<div class="fc-mirror-dots">${dots}</div>${pill}${more}</button>`)
    }
    const ambient=['galaxy','sakura','ocean','ember','matrix'].includes(a.theme);const matrix=a.theme==='matrix';
    host.innerHTML=`<div class="fc-mirror ${ambient?'ambient':''} ${matrix?'matrix':''}" style="--pm-a:${v.a};--pm-a2:${v.a2};--pm-bg:${v.bg};--pm-bg2:${v.bg2};--pm-surface:${v.surface};--pm-surface2:${v.surface2};--pm-border:${v.border}"><div class="fc-mirror-fx"><div class="fc-mirror-blob b1"></div><div class="fc-mirror-blob b2"></div><div class="fc-mirror-blob b3"></div><div class="fc-mirror-stars"></div></div><div class="fc-mirror-inner"><div class="fc-mirror-month"><div><div class="fc-mirror-month-title">${STATE.year}年 ${STATE.month+1}月</div><div class="fc-mirror-owner">${esc(STATE.viewName)}さんのカレンダー</div></div><span class="peek-live">LIVE</span></div><div class="fc-mirror-week">${orderedWeek(start).map(x=>`<span>${x}</span>`).join('')}</div><div class="fc-mirror-grid">${cells.join('')}</div></div><div class="fc-mirror-day-detail" id="fc-mirror-detail"></div></div>`;
    host.querySelectorAll('[data-mirror-day]').forEach(b=>b.addEventListener('click',()=>openDay(Number(b.dataset.mirrorDay))));
  }

  function openDay(day){
    const detail=document.getElementById('fc-mirror-detail'),dd=STATE.days?.[day]||{},evs=dd.events||[];if(!detail||!evs.length)return;const date=new Date(STATE.year,STATE.month,day),h=holiday(STATE.year,STATE.month,day,STATE.appearance);detail.innerHTML=`<div class="fc-detail-head"><button class="fc-detail-back" id="fc-detail-back">←</button><div class="fc-detail-date">${STATE.month+1}月${day}日（${DAY_NAMES[date.getDay()]}）${h?`<div class="fc-detail-holiday">${esc(h.name)}</div>`:''}</div><span class="fc-detail-live">● LIVE</span></div>${evs.map(e=>{const c=CAT[e.cat]||CAT.other;const time=e.allday?'終日':[e.start,e.end].filter(Boolean).join(' 〜 ')||'時刻未設定';const pri=e.pri==='high'?'高':e.pri==='low'?'低':'中';return `<div class="fc-detail-event ${e.done?'fc-detail-done':''}"><div class="fc-detail-line"><span class="fc-detail-cat" style="background:${c[0]}"></span><div class="fc-detail-title">${esc(e.title)}</div>${e.done?'<span style="font-size:.55rem;color:#42d984">✓ 完了</span>':''}</div><div class="fc-detail-time">${esc(time)}</div>${e.memo?`<div class="fc-detail-memo">${esc(e.memo)}</div>`:''}<div class="fc-detail-meta"><span class="fc-detail-chip">${esc(c[1])}</span>${e.visibility==='busy'?'<span class="fc-detail-chip">内容非公開</span>':`<span class="fc-detail-chip">優先度 ${pri}</span>`}</div></div>`}).join('')}`;detail.classList.add('open');document.getElementById('fc-detail-back').onclick=()=>detail.classList.remove('open')}

  async function subscribe(){
    if(!(await firebase()))return;if(STATE.unsub){try{STATE.unsub()}catch(_){ }}const {doc,onSnapshot}=STATE.fns;const ref=doc(STATE.db,'events',eventDocId(STATE.viewUid,STATE.year,STATE.month));STATE.unsub=onSnapshot(ref,s=>{const data=s.exists()?s.data():{};STATE.days=data.richDays||data.days||{};STATE.appearance=data.appearance||{};document.getElementById('peek-cal-title').textContent=`${STATE.viewName}・${STATE.year}年${STATE.month+1}月`;renderMirror()},e=>{console.warn('[Peek mirror] listen',e);STATE.days={};renderMirror()})
  }

  function open(uid,name){STATE.viewUid=uid;STATE.viewName=name||'FocusCal User';STATE.year=Number(localStorage.getItem('fc_active_year'))||new Date().getFullYear();STATE.month=new Date().getMonth();document.getElementById('peek-home').style.display='none';const cal=document.getElementById('peek-calendar');cal.classList.add('open','fc-mirror-mode');subscribe()}
  function close(){if(STATE.unsub){try{STATE.unsub()}catch(_){ }STATE.unsub=null}STATE.viewUid=null;document.getElementById('peek-calendar')?.classList.remove('fc-mirror-mode')}
  function move(delta){STATE.month+=delta;if(STATE.month<0){STATE.month=11;STATE.year--}if(STATE.month>11){STATE.month=0;STATE.year++}subscribe()}

  function intercept(){
    document.addEventListener('click',e=>{
      const openBtn=e.target.closest?.('[data-peek-open]');if(openBtn){e.preventDefault();e.stopImmediatePropagation();const person=openBtn.closest('.peek-person');const name=person?.querySelector('.peek-person-name')?.textContent?.trim()||'FocusCal User';open(openBtn.dataset.peekOpen,name);return}
      if(e.target.closest?.('#peek-cal-prev')){e.preventDefault();e.stopImmediatePropagation();if(STATE.viewUid)move(-1);return}
      if(e.target.closest?.('#peek-cal-next')){e.preventDefault();e.stopImmediatePropagation();if(STATE.viewUid)move(1);return}
      if(e.target.closest?.('#peek-cal-back')){if(STATE.viewUid){close();STATE.viewUid=null}return}
    },true);
  }

  function run(){injectStyle();hookStorage();intercept();setTimeout(publishExisting,700);window.FOCUSCAL_PEEK_MIRROR_BUILD=BUILD}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
