(()=>{'use strict';
const BUILD='78';
const PRESERVE=new Set(['btn-today','btn-prev','btn-next','btn-undo','btn-redo','settings-btn']);
const KNOWN=[
  ['fab-fit','💪','筋トレ記録'],['fab-book','📖','フレーズ帳'],['fab-party','🎉','お祝い'],
  ['fit-open','💪','筋トレ記録'],['pb-open','📖','フレーズ帳'],['party-open','🎉','お祝い'],
  ['peek-btn','👀','カレンダーを覗かせて頂く'],['fc-peek-btn','👀','カレンダーを覗かせて頂く'],
  ['fc-ai-btn','🧠','自動予定最適化'],['fc-account-btn','👤','アカウント'],['fc-collab-btn','🤝','共同スペース'],
  ['fc-notify-btn','🔔','通知センター'],['feedback-btn','💬','フィードバック'],['fc-feedback-btn','💬','フィードバック']
];
const FEATURE_RE=/フィードバック|覗|自動予定|アカウント|共同|通知|フレーズ|筋トレ|お祝い|💬|🧠|👤|🤝|🔔|👀|💪|📖|🎉/;
const EXCLUDE_RE=/英語フレーズを追加|中国語フレーズを追加|\+\s*英語フレーズ|\+\s*中国語フレーズ/;
const STYLE_TEXT=`
#fc-v78-menu{position:fixed;right:14px;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;flex-direction:column;gap:9px;align-items:flex-end;max-height:64dvh;overflow:auto;padding:8px 2px;overscroll-behavior:contain;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(.97);transform-origin:bottom right;transition:opacity .22s ease,transform .28s cubic-bezier(.22,1,.36,1),visibility 0s linear .28s}
#fc-v78-menu.open{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1);transition:opacity .2s ease,transform .3s cubic-bezier(.22,1,.36,1),visibility 0s}
.fc-v78-item{display:flex;align-items:center;gap:10px;min-width:186px;max-width:min(78vw,300px);padding:11px 14px;border-radius:18px;border:1px solid rgba(150,120,255,.3);background:rgba(20,15,38,.97);color:#f5f2ff;box-shadow:0 12px 32px rgba(0,0,0,.38);backdrop-filter:blur(16px);font:700 .76rem/1.2 -apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif;opacity:0;transform:translateX(14px) translateY(10px) scale(.94);transition:opacity .18s ease,transform .28s cubic-bezier(.22,1,.36,1)}
#fc-v78-menu.open .fc-v78-item{opacity:1;transform:translateX(0) translateY(0) scale(1);transition-delay:calc(var(--i,0) * 32ms)}
.fc-v78-item .icon{font-size:1.18rem;line-height:1}.fc-v78-item .label{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fc-v78-origin-hidden{position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
.fc-v78-native-hidden{display:none!important;visibility:hidden!important;pointer-events:none!important}
#fab-main{transition:transform .3s cubic-bezier(.34,1.4,.5,1),box-shadow .22s ease!important;will-change:transform}
#fab-main.fc-v78-open{transform:rotate(135deg) scale(1.04)!important;box-shadow:0 7px 28px rgba(124,92,252,.58)!important}
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important}
@media(prefers-reduced-motion:reduce){#fc-v78-menu,.fc-v78-item,#fab-main{transition:none!important}}
`;
function inject(){if(document.getElementById('fc-v78-style'))return;const s=document.createElement('style');s.id='fc-v78-style';s.textContent=STYLE_TEXT;document.head.appendChild(s)}
function mainFab(){return document.getElementById('fab-main')}
function nativeFabParent(){return document.getElementById('fab-cluster')||mainFab()?.parentElement||null}
function ensureMenu(){let m=document.getElementById('fc-v78-menu');if(!m){m=document.createElement('div');m.id='fc-v78-menu';m.setAttribute('role','menu');m.setAttribute('aria-label','FocusCal 機能メニュー');document.body.appendChild(m)}return m}
function rawText(el){return `${el?.getAttribute?.('title')||''} ${el?.getAttribute?.('aria-label')||''} ${(el?.textContent||'').trim()}`.trim()}
function info(el){if(!el)return null;const txt=rawText(el);if(EXCLUDE_RE.test(txt))return null;const known=KNOWN.find(([id])=>id===el.id);if(known)return{icon:known[1],label:known[2]};if(!FEATURE_RE.test(txt))return null;const icon=(txt.match(/💬|🧠|👤|🤝|🔔|👀|💪|📖|🎉/)||['✦'])[0];const label=(el.getAttribute?.('aria-label')||el.getAttribute?.('title')||(el.textContent||'').replace(icon,'').trim()||'機能');if(EXCLUDE_RE.test(label))return null;return{icon,label}}
function originKey(el){return el.id?`id:${el.id}`:`anon:${(el.getAttribute?.('title')||el.textContent||'feature').trim()}`}
function hasKey(menu,key){return [...menu.querySelectorAll('[data-key]')].some(el=>el.dataset.key===key)}
function reindex(){[...ensureMenu().querySelectorAll('.fc-v78-item')].forEach((el,i)=>el.style.setProperty('--i',i))}
function addItem(origin){const meta=info(origin);if(!meta)return;const menu=ensureMenu(),key=originKey(origin);if(hasKey(menu,key))return;const b=document.createElement('button');b.type='button';b.className='fc-v78-item';b.dataset.key=key;b.innerHTML=`<span class="icon">${meta.icon}</span><span class="label"></span>`;b.querySelector('.label').textContent=meta.label;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOpen(false);const wasNative=origin.classList.contains('fab-item');origin.classList.remove('fc-v78-origin-hidden','fc-v78-native-hidden');try{origin.click()}catch(err){console.error('[FocusCal v78 feature]',meta.label,err)}finally{queueMicrotask(()=>{if(wasNative)origin.classList.add('fc-v78-native-hidden');else hideOrigin(origin)})}});menu.appendChild(b);reindex()}
function hideOrigin(el){if(!el||PRESERVE.has(el.id)||el===mainFab())return;el.classList.add('fc-v78-origin-hidden')}
function harvestNative(){const p=nativeFabParent(),main=mainFab();if(!p||!main)return;['fab-fit','fab-book','fab-party'].forEach(id=>{const el=document.getElementById(id);if(el){addItem(el);el.classList.add('fc-v78-native-hidden')}})}
function harvestFeatures(){KNOWN.forEach(([id])=>{const el=document.getElementById(id);if(el&&!['fab-fit','fab-book','fab-party'].includes(id)){addItem(el);hideOrigin(el)}});document.querySelectorAll('button,[role="button"],a,.nav-btn').forEach(el=>{if(PRESERVE.has(el.id)||el===mainFab()||el.closest?.('#fc-v78-menu'))return;const txt=rawText(el);if(EXCLUDE_RE.test(txt))return;const r=el.getBoundingClientRect?.();const nearTop=r&&r.top<260;const meta=info(el);if(meta&&nearTop){addItem(el);hideOrigin(el)}})}
function restoreHeader(){const s=document.getElementById('settings-btn'),h=document.getElementById('header-row');if(s){s.hidden=false;s.classList.remove('fc-v78-origin-hidden','fc-v78-native-hidden');s.style.setProperty('display','flex','important');s.style.setProperty('visibility','visible','important');s.style.setProperty('opacity','1','important');if(h&&s.parentElement!==h)h.appendChild(s)}}
function setOpen(open){const menu=ensureMenu(),main=mainFab();menu.classList.toggle('open',open);main?.classList.toggle('fc-v78-open',open);main?.setAttribute('aria-expanded',open?'true':'false');if(open)navigator.vibrate?.(8)}
function bindFab(){const main=mainFab();if(!main||main.dataset.fcV78Bound==='1')return;main.dataset.fcV78Bound='1';main.setAttribute('aria-expanded','false');main.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const cluster=nativeFabParent();cluster?.classList.remove('open');harvestNative();harvestFeatures();setOpen(!ensureMenu().classList.contains('open'))},true);document.addEventListener('click',e=>{const menu=ensureMenu();if(!menu.contains(e.target)&&e.target!==main&&!main.contains?.(e.target))setOpen(false)},true)}
function clean(){try{inject();restoreHeader();harvestNative();harvestFeatures();bindFab();restoreHeader();document.documentElement.dataset.fcFeatureMenuBuild=BUILD}catch(err){console.error('[FocusCal feature menu fatal]',err)}}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,24)});mo.observe(document.body,{subtree:true,childList:true});[0,100,250,500,1000,1800,3000,5000,8000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalFeatureMenu={clean,setOpen,build:BUILD,required:KNOWN.map(x=>x[2])}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();