(()=>{'use strict';
const BUILD='79';
const PRESERVE=new Set(['btn-today','btn-prev','btn-next','btn-undo','btn-redo','settings-btn']);
const KNOWN=[
  ['fab-fit','💪','筋トレ記録'],['fab-book','📖','フレーズ帳'],['fab-party','🎉','お祝い'],
  ['peek-btn','👀','カレンダーを覗かせて頂く'],['fc-peek-btn','👀','カレンダーを覗かせて頂く'],
  ['fc-ai-btn','🧠','自動予定最適化'],['fc-account-btn','👤','アカウント'],['fc-collab-btn','🤝','共同スペース'],
  ['fc-notify-btn','🔔','通知センター'],['feedback-btn','💬','フィードバック'],['fc-feedback-btn','💬','フィードバック']
];
const NATIVE_IDS=new Set(['fab-fit','fab-book','fab-party']);
const STYLE_TEXT=`
#fc-v79-menu{position:fixed;right:14px;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;flex-direction:column;gap:9px;align-items:flex-end;max-height:64dvh;overflow:auto;padding:8px 2px;overscroll-behavior:contain;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(.97);transform-origin:bottom right;transition:opacity .22s ease,transform .28s cubic-bezier(.22,1,.36,1),visibility 0s linear .28s}
#fc-v79-menu.open{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1);transition:opacity .2s ease,transform .3s cubic-bezier(.22,1,.36,1),visibility 0s}
.fc-v79-item{display:flex;align-items:center;gap:10px;min-width:186px;max-width:min(78vw,300px);padding:11px 14px;border-radius:18px;border:1px solid rgba(150,120,255,.3);background:rgba(20,15,38,.97);color:#f5f2ff;box-shadow:0 12px 32px rgba(0,0,0,.38);backdrop-filter:blur(16px);font:700 .76rem/1.2 -apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;opacity:0;transform:translateX(14px) translateY(10px) scale(.94);transition:opacity .18s ease,transform .28s cubic-bezier(.22,1,.36,1)}
#fc-v79-menu.open .fc-v79-item{opacity:1;transform:translateX(0) translateY(0) scale(1);transition-delay:calc(var(--i,0) * 32ms)}
.fc-v79-item .icon{font-size:1.18rem;line-height:1}.fc-v79-item .label{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fc-v79-origin-hidden{position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
.fc-v79-native-hidden{display:none!important;visibility:hidden!important;pointer-events:none!important}
#fab-main{transition:transform .3s cubic-bezier(.34,1.4,.5,1),box-shadow .22s ease!important;will-change:transform}
#fab-main.fc-v79-open{transform:rotate(135deg) scale(1.04)!important;box-shadow:0 7px 28px rgba(124,92,252,.58)!important}
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important}
@media(prefers-reduced-motion:reduce){#fc-v79-menu,.fc-v79-item,#fab-main{transition:none!important}}
`;
function inject(){if(document.getElementById('fc-v79-style'))return;const s=document.createElement('style');s.id='fc-v79-style';s.textContent=STYLE_TEXT;document.head.appendChild(s)}
function mainFab(){return document.getElementById('fab-main')}
function ensureMenu(){let m=document.getElementById('fc-v79-menu');if(!m){m=document.createElement('div');m.id='fc-v79-menu';m.setAttribute('role','menu');m.setAttribute('aria-label','FocusCal 機能メニュー');document.body.appendChild(m)}return m}
function metaForId(id){const k=KNOWN.find(x=>x[0]===id);return k?{icon:k[1],label:k[2]}:null}
function originKey(el){return `id:${el.id}`}
function hasKey(menu,key){return [...menu.querySelectorAll('[data-key]')].some(el=>el.dataset.key===key)}
function reindex(){[...ensureMenu().querySelectorAll('.fc-v79-item')].forEach((el,i)=>el.style.setProperty('--i',i))}
function unhideOrigin(origin){origin.classList.remove('fc-v79-origin-hidden','fc-v79-native-hidden')}
function rehhideOrigin(origin){if(NATIVE_IDS.has(origin.id))origin.classList.add('fc-v79-native-hidden');else origin.classList.add('fc-v79-origin-hidden')}
function forwardPhase(origin,phase,source){unhideOrigin(origin);const down=phase==='down';try{
  if(window.PointerEvent)origin.dispatchEvent(new PointerEvent(down?'pointerdown':'pointerup',{bubbles:true,cancelable:true,pointerId:source?.pointerId||1,pointerType:source?.pointerType||'touch',clientX:source?.clientX||0,clientY:source?.clientY||0}));
  origin.dispatchEvent(new MouseEvent(down?'mousedown':'mouseup',{bubbles:true,cancelable:true,clientX:source?.clientX||0,clientY:source?.clientY||0}));
  origin.dispatchEvent(new Event(down?'touchstart':'touchend',{bubbles:true,cancelable:true}));
}catch(err){console.warn('[FocusCal v79 longpress forward]',err)}
if(!down)queueMicrotask(()=>rehhideOrigin(origin))}
function addItem(origin){if(!origin?.id)return;const meta=metaForId(origin.id);if(!meta)return;const menu=ensureMenu(),key=originKey(origin);if(hasKey(menu,key))return;const b=document.createElement('button');b.type='button';b.className='fc-v79-item';b.dataset.key=key;b.innerHTML=`<span class="icon">${meta.icon}</span><span class="label"></span>`;b.querySelector('.label').textContent=meta.label;
  let held=false,longTimer=null,pressActive=false;
  if(origin.id==='fab-party'){
    b.addEventListener('pointerdown',e=>{pressActive=true;held=false;forwardPhase(origin,'down',e);clearTimeout(longTimer);longTimer=setTimeout(()=>{if(pressActive){held=true;navigator.vibrate?.([18,30,18])}},650)});
    const finish=e=>{if(!pressActive)return;pressActive=false;clearTimeout(longTimer);forwardPhase(origin,'up',e);if(held){e.preventDefault();e.stopPropagation();setOpen(false)}};
    b.addEventListener('pointerup',finish);b.addEventListener('pointercancel',finish);b.addEventListener('pointerleave',e=>{if(e.buttons)finish(e)});
  }
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(origin.id==='fab-party'&&held){held=false;return}setOpen(false);unhideOrigin(origin);try{origin.click()}catch(err){console.error('[FocusCal v79 feature]',meta.label,err)}finally{queueMicrotask(()=>rehhideOrigin(origin))}});
  menu.appendChild(b);reindex()}
function hideKnownOrigins(){KNOWN.forEach(([id])=>{const el=document.getElementById(id);if(!el)return;addItem(el);if(PRESERVE.has(id)||el===mainFab())return;rehhideOrigin(el)})}
function removeInertMenuItems(){const allowed=new Set(KNOWN.map(x=>`id:${x[0]}`));ensureMenu().querySelectorAll('.fc-v79-item').forEach(el=>{if(!allowed.has(el.dataset.key))el.remove()});reindex()}
function restoreHeader(){const s=document.getElementById('settings-btn'),h=document.getElementById('header-row');if(s){s.hidden=false;s.classList.remove('fc-v79-origin-hidden','fc-v79-native-hidden');s.style.setProperty('display','flex','important');s.style.setProperty('visibility','visible','important');s.style.setProperty('opacity','1','important');if(h&&s.parentElement!==h)h.appendChild(s)}}
function setOpen(open){const menu=ensureMenu(),main=mainFab();menu.classList.toggle('open',open);main?.classList.toggle('fc-v79-open',open);main?.setAttribute('aria-expanded',open?'true':'false');if(open)navigator.vibrate?.(8)}
function bindFab(){const main=mainFab();if(!main||main.dataset.fcV79Bound==='1')return;main.dataset.fcV79Bound='1';main.setAttribute('aria-expanded','false');main.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();document.getElementById('fab-cluster')?.classList.remove('open');hideKnownOrigins();removeInertMenuItems();setOpen(!ensureMenu().classList.contains('open'))},true);document.addEventListener('click',e=>{const menu=ensureMenu();if(!menu.contains(e.target)&&e.target!==main&&!main.contains?.(e.target))setOpen(false)},true)}
function clean(){try{inject();restoreHeader();hideKnownOrigins();removeInertMenuItems();bindFab();restoreHeader();document.documentElement.dataset.fcFeatureMenuBuild=BUILD}catch(err){console.error('[FocusCal feature menu fatal]',err)}}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,24)});mo.observe(document.body,{subtree:true,childList:true});[0,100,250,500,1000,1800,3000,5000,8000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalFeatureMenu={clean,setOpen,build:BUILD,required:KNOWN.map(x=>x[2])}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();