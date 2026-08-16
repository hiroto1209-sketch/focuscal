(() => {
  'use strict';
  const BUILD='59';
  const STATE={db:null,auth:null,uid:null,fns:null,viewUid:null,year:null,month:null,unsub:null,days:{},timer:null};
  const eventDocId=(uid,y,m)=>`${uid}_${y}_${m}`;

  const FALLBACK_COLORS={
    white:'#e8e8f0',silver:'#a0a8b8',red:'#e04848',crimson:'#c82858',coral:'#e87858',
    orange:'#e89038',gold:'#d6aa32',yellow:'#d8c840',lime:'#84b83c',green:'#3aa86a',
    emerald:'#2fb87a',teal:'#27a9a0',cyan:'#30a8d8',sky:'#5aa8e8',blue:'#4278d8',
    indigo:'#5b62d6',violet:'#8058d8',purple:'#9858c8',pink:'#d84f91',rose:'#dc6686',
    brown:'#9a7558',gray:'#73798a',black:'#444755'
  };

  const STYLE=`
    .fc-mirror-day.fc-shared-colored{
      border-color:color-mix(in srgb,var(--fc-cell-color) 72%,transparent)!important;
      background:linear-gradient(160deg,color-mix(in srgb,var(--fc-cell-color) 18%,var(--pm-surface)),color-mix(in srgb,var(--fc-cell-color) 7%,var(--pm-surface2)))!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fc-cell-color) 25%,transparent),0 0 16px color-mix(in srgb,var(--fc-cell-color) 8%,transparent)!important;
    }
    .fc-mirror-day.fc-shared-colored .fc-mirror-date{color:color-mix(in srgb,var(--fc-cell-color) 35%,#fff)!important}
    .fc-mirror-day.fc-shared-fx-glow{animation:fcSharedGlow 2.4s ease-in-out infinite alternate}
    .fc-mirror-day.fc-shared-fx-pulse{animation:fcSharedPulse 1.8s ease-in-out infinite}
    .fc-mirror-day.fc-shared-fx-shine:before{content:'';position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.12) 50%,transparent 65%);transform:translateX(-70%);animation:fcSharedShine 3.4s ease-in-out infinite;pointer-events:none}
    .fc-mirror-day.fc-shared-fx-sparkle:after{content:'✦';position:absolute;right:7px;bottom:5px;font-size:7px;color:var(--fc-cell-color,#fff);opacity:.72;animation:fcSharedSpark 1.6s ease-in-out infinite alternate;pointer-events:none}
    @keyframes fcSharedGlow{to{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fc-cell-color) 35%,transparent),0 0 18px color-mix(in srgb,var(--fc-cell-color) 34%,transparent)}}
    @keyframes fcSharedPulse{50%{transform:scale(.975);filter:brightness(1.12)}}
    @keyframes fcSharedShine{55%,100%{transform:translateX(70%)}}
    @keyframes fcSharedSpark{to{opacity:1;transform:scale(1.25) rotate(12deg)}}
    @media(prefers-reduced-motion:reduce){.fc-mirror-day[class*='fc-shared-fx-']{animation:none!important}.fc-mirror-day.fc-shared-fx-shine:before,.fc-mirror-day.fc-shared-fx-sparkle:after{animation:none!important}}
  `;

  function injectStyle(){if(document.getElementById('fc-peek-cell-style-v59'))return;const s=document.createElement('style');s.id='fc-peek-cell-style-v59';s.textContent=STYLE;document.head.appendChild(s)}
  function colorHex(key){if(!key)return null;if(/^#[0-9a-f]{6}$/i.test(key))return key;try{if(typeof COLORS!=='undefined'){const c=COLORS.find(x=>x.key===key);if(c?.hex)return c.hex}}catch(_){ }return FALLBACK_COLORS[key]||null}
  function readSettings(){try{return JSON.parse(localStorage.getItem('fc_settings'))||{}}catch(_){return{}}}
  function appearance(){const s=readSettings();return{theme:s.theme||'violet',bgTint:s.bgTint||'default',weekStart:Number(s.weekStart)||0,holidaysEnabled:localStorage.getItem('fc_holidays_enabled')!=='0'}}
  function richMonth(y,m){
    let raw={};try{raw=JSON.parse(localStorage.getItem(`fc_${y}_${m}`))||{}}catch(_){ }
    const out={};
    for(const [day,dd] of Object.entries(raw)){
      if(!dd)continue;
      const events=Array.isArray(dd.events)?dd.events.filter(e=>e.peekVisibility!=='private').map(e=>{
        const busy=e.peekVisibility==='busy';return{title:busy?'予定あり':String(e.title||''),memo:busy?'':String(e.memo||''),cat:busy?'other':(e.cat||'other'),pri:busy?'':(e.pri||'med'),allday:!!e.allday,start:busy?'':(e.start||''),end:busy?'':(e.end||''),done:!!e.done,visibility:e.peekVisibility||'full'};
      }):[];
      const hex=colorHex(dd.color);
      if(events.length||hex||dd.effect){out[day]={color:hex,colorKey:dd.color||null,effect:dd.effect||null,events}}
    }
    return out;
  }

  async function firebase(){
    if(STATE.db&&STATE.auth?.currentUser)return true;const cfg=window.FOCUSCAL_FIREBASE_CONFIG;if(!cfg)return false;
    try{
      const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,doc,setDoc,onSnapshot,serverTimestamp}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
      const app=getApps().length?getApp():initializeApp(cfg);STATE.auth=getAuth(app);STATE.db=getFirestore(app);STATE.fns={doc,setDoc,onSnapshot,serverTimestamp};if(!STATE.auth.currentUser)await signInAnonymously(STATE.auth);STATE.uid=STATE.auth.currentUser.uid;return true;
    }catch(e){console.warn('[Peek cell v59] firebase',e);return false}
  }
  async function publishMonth(y,m){if(!(await firebase()))return;const key=`fc_${y}_${m}`;if(localStorage.getItem(key)==null)return;try{const {doc,setDoc,serverTimestamp}=STATE.fns;await setDoc(doc(STATE.db,'events',eventDocId(STATE.uid,y,m)),{richDays:richMonth(y,m),appearance:appearance(),cellStyleBuild:BUILD,cellStyleUpdatedAt:serverTimestamp()},{merge:true})}catch(e){console.warn('[Peek cell v59] publish',e)}}
  function schedulePublish(y,m){clearTimeout(STATE.timer);STATE.timer=setTimeout(()=>publishMonth(y,m),180)}
  function publishExisting(){const y=Number(localStorage.getItem('fc_active_year'))||new Date().getFullYear();for(let m=0;m<12;m++)if(localStorage.getItem(`fc_${y}_${m}`)!=null)publishMonth(y,m)}
  function hookStorage(){if(Storage.prototype.setItem.__fcCell59)return;const prev=Storage.prototype.setItem;const wrapped=function(k,v){const r=prev.call(this,k,v);try{const mm=/^fc_(\d{4})_(\d{1,2})$/.exec(String(k));if(mm)schedulePublish(+mm[1],+mm[2]);else if(k==='fc_settings'||k==='fc_holidays_enabled')publishExisting()}catch(_){ }return r};wrapped.__fcCell59=true;Storage.prototype.setItem=wrapped}

  function parseView(){const title=document.getElementById('peek-cal-title')?.textContent||'';const mm=/(\d{4})年(\d{1,2})月/.exec(title);if(mm){STATE.year=+mm[1];STATE.month=+mm[2]-1}}
  function decorate(){
    const grid=document.querySelector('.fc-mirror-grid');if(!grid)return;
    grid.querySelectorAll('[data-mirror-day]').forEach(cell=>{
      const day=+cell.dataset.mirrorDay,dd=STATE.days?.[day]||{};const hex=colorHex(dd.color||dd.colorKey);
      cell.classList.remove('fc-shared-colored','fc-shared-fx-glow','fc-shared-fx-pulse','fc-shared-fx-shine','fc-shared-fx-sparkle');cell.style.removeProperty('--fc-cell-color');
      if(hex){cell.classList.add('fc-shared-colored');cell.style.setProperty('--fc-cell-color',hex)}
      if(dd.effect&&dd.effect!=='none')cell.classList.add(`fc-shared-fx-${String(dd.effect).replace(/[^a-z0-9_-]/gi,'')}`);
    });
  }
  async function subscribeView(){if(!STATE.viewUid||STATE.year==null||STATE.month==null||!(await firebase()))return;if(STATE.unsub){try{STATE.unsub()}catch(_){ }}const {doc,onSnapshot}=STATE.fns;STATE.unsub=onSnapshot(doc(STATE.db,'events',eventDocId(STATE.viewUid,STATE.year,STATE.month)),s=>{const d=s.exists()?s.data():{};STATE.days=d.richDays||d.days||{};requestAnimationFrame(()=>setTimeout(decorate,20))})}
  function captureClicks(){
    document.addEventListener('click',e=>{
      const open=e.target.closest?.('[data-peek-open]');if(open){STATE.viewUid=open.dataset.peekOpen;setTimeout(()=>{parseView();subscribeView()},180);return}
      if(e.target.closest?.('#peek-cal-prev,#peek-cal-next'))setTimeout(()=>{parseView();subscribeView()},180);
    },true);
  }
  function observeRender(){const mo=new MutationObserver(()=>decorate());mo.observe(document.documentElement,{subtree:true,childList:true});setTimeout(()=>mo.disconnect(),60000)}
  function run(){injectStyle();hookStorage();captureClicks();observeRender();setTimeout(publishExisting,900);window.FOCUSCAL_CELL_STYLE_BUILD=BUILD}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
