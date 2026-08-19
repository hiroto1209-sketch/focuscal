(()=>{'use strict';
const BUILD='80';
const FEATURES=[
 ['peek-btn','👀','カレンダーを覗かせて頂く'],['fc-peek-btn','👀','カレンダーを覗かせて頂く'],
 ['fc-ai-btn','🧠','自動予定最適化'],['fc-account-btn','👤','アカウント'],['fc-collab-btn','🤝','共同スペース'],
 ['fc-notify-btn','🔔','通知センター'],['feedback-btn','💬','フィードバック'],['fc-feedback-btn','💬','フィードバック']
];
const NATIVE=new Set(['fab-fit','fab-book','fab-party']);
const STYLE=`
/* v80: recreate the original v50 FAB behavior and keep all newer actions */
#fab-cluster{pointer-events:none!important;overflow:visible!important}
#fab-main{pointer-events:auto!important;transition:transform .28s cubic-bezier(.34,1.4,.5,1),box-shadow .2s!important}
#fab-main:active{transform:scale(.9)!important}
#fab-cluster.open #fab-main{transform:rotate(135deg)!important}
#fab-cluster .fab-item{opacity:0;transform:translateY(26px) scale(.4);pointer-events:none;transition:opacity .22s ease,transform .32s cubic-bezier(.34,1.5,.5,1)!important}
#fab-cluster.open .fab-item{opacity:1;transform:translateY(0) scale(1);pointer-events:auto!important;transition-delay:var(--fc-v80-delay,0s)!important}
#fab-cluster .fab-item:active{transform:scale(.86)!important}
#fab-cluster .fab-label{position:absolute;right:calc(100% + 9px);top:50%;transform:translateY(-50%);background:var(--surface2);border:1px solid var(--border2);color:var(--text2);font-size:.62rem;font-weight:600;padding:5px 10px;border-radius:8px;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none;letter-spacing:.04em}
#fab-cluster.open .fab-item .fab-label{opacity:1;transition-delay:.2s}
.fc-v80-origin{position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}
.fc-v80-proxy{width:46px!important;height:46px!important;border-radius:50%!important;border:1px solid var(--border2)!important;background:var(--surface)!important;color:var(--text2)!important;box-shadow:0 3px 14px rgba(0,0,0,.45)!important;font-size:1.15rem!important;display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;padding:0!important;min-width:46px!important}
@media(max-height:720px){#fab-cluster{gap:7px!important}.fc-v80-proxy,#fab-cluster>.fab-item{width:42px!important;height:42px!important;min-width:42px!important}.fab-label{font-size:.58rem!important}}
@media(prefers-reduced-motion:reduce){#fab-cluster .fab-item,#fab-main{transition:none!important}}
`;
function inject(){if(document.getElementById('fc-v80-style'))return;const s=document.createElement('style');s.id='fc-v80-style';s.textContent=STYLE;document.head.appendChild(s)}
function cluster(){return document.getElementById('fab-cluster')}
function main(){return document.getElementById('fab-main')}
function cleanupLegacy(){document.querySelectorAll('#fc-v77-menu,#fc-v78-menu,#fc-v79-menu').forEach(x=>x.remove());const m=main();if(m)m.classList.remove('fc-v77-open','fc-v78-open','fc-v79-open')}
function meta(id){const x=FEATURES.find(v=>v[0]===id);return x?{icon:x[1],label:x[2]}:null}
function proxyKey(id){return `fc-v80-${id}`}
function closeSoon(){setTimeout(()=>cluster()?.classList.remove('open'),120)}
function addProxy(origin){if(!origin?.id||NATIVE.has(origin.id))return;const c=cluster(),m=main(),x=meta(origin.id);if(!c||!m||!x)return;if(document.getElementById(proxyKey(origin.id)))return;
 const b=document.createElement('button');b.type='button';b.id=proxyKey(origin.id);b.className='fab-item fc-v80-proxy';b.title=x.label;b.setAttribute('aria-label',x.label);b.innerHTML=`${x.icon}<span class="fab-label"></span>`;b.querySelector('.fab-label').textContent=x.label;
 b.addEventListener('click',e=>{e.stopPropagation();origin.classList.remove('fc-v80-origin');try{origin.click()}catch(err){console.error('[FocusCal v80 feature]',x.label,err)}finally{queueMicrotask(()=>origin.classList.add('fc-v80-origin'));closeSoon()}});
 c.insertBefore(b,m);origin.classList.add('fc-v80-origin')}
function ensureCurrentFeatures(){FEATURES.forEach(([id])=>{const el=document.getElementById(id);if(el)addProxy(el)})}
function restoreNative(){['fab-fit','fab-book','fab-party'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.classList.remove('fc-v77-native-hidden','fc-v78-native-hidden','fc-v79-native-hidden','fc-v77-origin-hidden','fc-v78-origin-hidden','fc-v79-origin-hidden','fc-v80-origin');el.style.removeProperty('display');el.style.removeProperty('visibility');el.style.removeProperty('pointer-events')})}
function applyDelays(){const items=[...(cluster()?.querySelectorAll(':scope > .fab-item')||[])];const n=items.length;items.forEach((el,i)=>{const fromMain=n-1-i;el.style.setProperty('--fc-v80-delay',`${Math.max(0,fromMain)*0.045}s`)})}
function restoreHeader(){const s=document.getElementById('settings-btn'),h=document.getElementById('header-row');if(s&&h){s.hidden=false;s.style.setProperty('display','flex','important');s.style.setProperty('visibility','visible','important');s.style.setProperty('opacity','1','important');if(s.parentElement!==h)h.appendChild(s)}}
function clean(){try{inject();cleanupLegacy();restoreNative();ensureCurrentFeatures();applyDelays();restoreHeader();document.documentElement.dataset.fcFeatureMenuBuild=BUILD}catch(err){console.error('[FocusCal v80 FAB]',err)}}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,30)});mo.observe(document.body,{subtree:true,childList:true});[0,100,250,500,1000,1800,3000,5000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalFeatureMenu={clean,build:BUILD,mode:'v50-native-fab'}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();