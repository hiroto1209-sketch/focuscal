(()=>{'use strict';
const BUILD='76';
const PRESERVE=new Set(['btn-today','btn-prev','btn-next','btn-undo','btn-redo','settings-btn']);
const KNOWN=[
  ['fit-open','💪','筋トレ記録'],['pb-open','📖','フレーズ帳'],['party-open','🎉','お祝い'],
  ['peek-btn','👀','カレンダーを覗かせて頂く'],['fc-peek-btn','👀','カレンダーを覗かせて頂く'],
  ['fc-ai-btn','🧠','自動予定最適化'],['fc-account-btn','👤','アカウント'],['fc-collab-btn','🤝','共同スペース'],
  ['fc-notify-btn','🔔','通知センター'],['feedback-btn','💬','フィードバック'],['fc-feedback-btn','💬','フィードバック']
];
const FEATURE_RE=/フィードバック|覗|自動予定|アカウント|共同|通知|フレーズ|筋トレ|お祝い|💬|🧠|👤|🤝|🔔|👀|💪|📖|🎉/;
const CSS=`
#fc-v76-menu{position:fixed;right:14px;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:9998;display:none;flex-direction:column;gap:9px;align-items:flex-end;max-height:64dvh;overflow:auto;padding:8px 2px;overscroll-behavior:contain}
#fc-v76-menu.open{display:flex}
.fc-v76-item{display:flex;align-items:center;gap:10px;min-width:186px;max-width:min(78vw,300px);padding:11px 14px;border-radius:18px;border:1px solid rgba(150,120,255,.3);background:rgba(20,15,38,.97);color:#f5f2ff;box-shadow:0 12px 32px rgba(0,0,0,.38);backdrop-filter:blur(16px);font:700 .76rem/1.2 -apple-system,BlinkMacSystemFont,'Hiragino Sans',sans-serif}
.fc-v76-item .icon{font-size:1.18rem;line-height:1}.fc-v76-item .label{flex:1;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fc-v76-origin-hidden{position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
.fc-v76-native-hidden{display:none!important;visibility:hidden!important;pointer-events:none!important}
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important}
`;
function inject(){if(document.getElementById('fc-v76-style'))return;const s=document.createElement('style');s.id='fc-v76-style';s.textContent=CSS;document.head.appendChild(s)}
function mainFab(){return document.getElementById('fab-main')||document.querySelector('#fab-wrap > button:last-child,#fab-menu > button:last-child,.fab-wrap > button:last-child,#fab-container > button:last-child')}
function nativeFabParent(){return mainFab()?.parentElement||null}
function ensureMenu(){let m=document.getElementById('fc-v76-menu');if(!m){m=document.createElement('div');m.id='fc-v76-menu';m.setAttribute('role','menu');m.setAttribute('aria-label','FocusCal 機能メニュー');document.body.appendChild(m)}return m}
function info(el){if(!el)return null;const known=KNOWN.find(([id])=>id===el.id);if(known)return{icon:known[1],label:known[2]};const txt=`${el.getAttribute?.('title')||''} ${el.getAttribute?.('aria-label')||''} ${(el.textContent||'').trim()}`;if(!FEATURE_RE.test(txt))return null;const icon=(txt.match(/💬|🧠|👤|🤝|🔔|👀|💪|📖|🎉/)||['✦'])[0];const label=(el.getAttribute?.('aria-label')||el.getAttribute?.('title')||(el.textContent||'').replace(icon,'').trim()||'機能');return{icon,label}}
function originKey(el){return el.id?`id:${el.id}`:`anon:${(el.getAttribute?.('title')||el.textContent||'feature').trim()}`}
function addItem(origin){const meta=info(origin);if(!meta)return;const menu=ensureMenu(),key=originKey(origin);if(menu.querySelector(`[data-key="${CSS.escape(key)}"]`))return;const b=document.createElement('button');b.type='button';b.className='fc-v76-item';b.dataset.key=key;b.innerHTML=`<span class="icon">${meta.icon}</span><span class="label"></span>`;b.querySelector('.label').textContent=meta.label;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();menu.classList.remove('open');origin.classList.remove('fc-v76-origin-hidden','fc-v76-native-hidden');try{origin.click()}finally{queueMicrotask(()=>hideOrigin(origin))}});menu.appendChild(b)}
function hideOrigin(el){if(!el||PRESERVE.has(el.id)||el===mainFab())return;el.classList.add('fc-v76-origin-hidden')}
function harvestNative(){const p=nativeFabParent(),main=mainFab();if(!p||!main)return;[...p.children].forEach(el=>{if(el===main)return;const meta=info(el);if(meta){addItem(el);el.classList.add('fc-v76-native-hidden')}})}
function harvestFeatures(){KNOWN.forEach(([id])=>{const el=document.getElementById(id);if(el){addItem(el);hideOrigin(el)}});document.querySelectorAll('button,[role="button"],a,.nav-btn').forEach(el=>{if(PRESERVE.has(el.id)||el===mainFab()||el.closest?.('#fc-v76-menu'))return;const r=el.getBoundingClientRect?.();const nearTop=r&&r.top<240;const meta=info(el);if(meta&&(nearTop||KNOWN.some(([id])=>id===el.id))){addItem(el);hideOrigin(el)}})}
function restoreHeader(){const s=document.getElementById('settings-btn'),h=document.getElementById('header-row');if(s){s.hidden=false;s.classList.remove('fc-v76-origin-hidden','fc-v76-native-hidden');s.style.setProperty('display','flex','important');if(h&&s.parentElement!==h)h.appendChild(s)}}
function bindFab(){const main=mainFab();if(!main||main.dataset.fcV76Bound==='1')return;main.dataset.fcV76Bound='1';main.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();harvestNative();harvestFeatures();ensureMenu().classList.toggle('open')},true);document.addEventListener('click',e=>{const menu=ensureMenu();if(!menu.contains(e.target)&&e.target!==main&&!main.contains?.(e.target))menu.classList.remove('open')},true)}
function clean(){inject();restoreHeader();harvestNative();harvestFeatures();bindFab();restoreHeader()}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,24)});mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','style','title','aria-label']});[0,100,250,500,1000,1800,3000,5000,8000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalFeatureMenu={clean,build:BUILD,required:KNOWN.map(x=>x[2])}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();