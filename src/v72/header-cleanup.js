(()=>{'use strict';
const BUILD='74';
const PRESERVE=new Set(['btn-today','btn-prev','btn-next','btn-undo','btn-redo','settings-btn']);
const LABELS={
  'feedback-btn':'フィードバック','fc-feedback-btn':'フィードバック',
  'peek-btn':'覗かせて頂く','fc-peek-btn':'覗かせて頂く',
  'fc-ai-btn':'自動予定最適化','fc-account-btn':'アカウント',
  'fc-collab-btn':'共同スペース','fc-notify-btn':'通知センター',
  'pb-open':'フレーズ帳','fit-open':'筋トレ記録','party-open':'お祝い'
};
const FEATURE_RE=/フィードバック|覗|自動予定|アカウント|共同|通知|フレーズ|筋トレ|お祝い|💬|🧠|👤|🤝|🔔|👀/;
const CSS=`
#header-row{overflow:visible!important;min-width:0!important;display:flex!important;align-items:center!important}
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;order:99!important}
.fc-secondary-pending{display:none!important}
#fab-wrap .fc-v74-action,#fab-menu .fc-v74-action,.fab-wrap .fc-v74-action,#fab-container .fc-v74-action{display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important}
#fab-wrap .fc-v74-action .fab-label,#fab-menu .fc-v74-action .fab-label,.fab-wrap .fc-v74-action .fab-label,#fab-container .fc-v74-action .fab-label{pointer-events:none}
@media(max-width:520px){#header-row{gap:6px!important}#fab-wrap .fc-v74-action,#fab-menu .fc-v74-action,.fab-wrap .fc-v74-action,#fab-container .fc-v74-action{width:54px;height:54px;border-radius:50%;font-size:1.18rem}}
`;
function style(){if(document.getElementById('fc-v74-header-style'))return;const s=document.createElement('style');s.id='fc-v74-header-style';s.textContent=CSS;document.head.appendChild(s)}
function fabWrap(){return document.getElementById('fab-wrap')||document.getElementById('fab-menu')||document.querySelector('.fab-wrap')||document.getElementById('fab-container')}
function mainFab(){return document.getElementById('fab-main')||document.querySelector('#fab-wrap > button:last-child,#fab-menu > button:last-child,.fab-wrap > button:last-child,#fab-container > button:last-child')}
function textOf(el){return `${el.getAttribute?.('title')||''} ${el.getAttribute?.('aria-label')||''} ${(el.textContent||'').trim()}`.trim()}
function labelFor(el){return LABELS[el.id]||el.getAttribute?.('aria-label')||el.getAttribute?.('title')||((el.textContent||'').trim()||'機能')}
function inTopArea(el){try{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<190&&r.bottom>40}catch{return false}}
function looksSecondary(el){
  if(!el||el.nodeType!==1||PRESERVE.has(el.id)||el.id==='fab-main')return false;
  const wrap=fabWrap();if(wrap&&wrap.contains(el))return false;
  if(LABELS[el.id])return true;
  const txt=textOf(el);if(FEATURE_RE.test(txt))return true;
  if(el.matches?.('.nav-btn,[data-fc-secondary-action]')&&inTopArea(el))return true;
  /* Final safety net for old header controls: interactive circular controls in the top area whose text is an emoji feature icon. */
  if(inTopArea(el)&&el.matches?.('button,[role="button"],a,.nav-btn')&&/^(💬|🧠|👤|🤝|🔔|👀)$/.test((el.textContent||'').trim()))return true;
  return false;
}
function makeLabel(el){if(el.querySelector?.('.fab-label'))return;const sp=document.createElement('span');sp.className='fab-label';sp.textContent=labelFor(el);el.appendChild(sp)}
function move(el){
  if(!looksSecondary(el))return;
  el.classList.add('fc-secondary-pending');
  const wrap=fabWrap(),main=mainFab();if(!wrap||!main)return;
  el.classList.remove('nav-btn','fc-secondary-pending');el.classList.add('fab-item','fc-v74-action');el.dataset.fcV74Moved='1';makeLabel(el);
  wrap.insertBefore(el,main);el.setAttribute('data-fc-secondary-action','1');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label',labelFor(el));
}
function restoreSettings(){
  const settings=document.getElementById('settings-btn'),header=document.getElementById('header-row');if(!settings)return;
  settings.hidden=false;settings.classList.remove('fc-secondary-pending','fab-item','fc-v71-action','fc-v72-action','fc-v73-action','fc-v74-action');settings.classList.add('nav-btn');delete settings.dataset.fcSecondaryAction;
  settings.style.setProperty('display','flex','important');settings.style.setProperty('visibility','visible','important');settings.style.setProperty('opacity','1','important');
  if(header&&settings.parentElement!==header)header.appendChild(settings);
}
function clean(){
  style();restoreSettings();
  /* Scan all possible interactive controls because old FocusCal modules do not all use <button>. */
  document.querySelectorAll('button,[role="button"],a.nav-btn,.nav-btn').forEach(move);
  Object.keys(LABELS).forEach(id=>{const el=document.getElementById(id);if(el)move(el)});
  restoreSettings();
}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,12)});mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','title','aria-label']});[0,40,100,220,450,900,1600,2800,5000,8000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('focuscal:data-changed',clean);window.addEventListener('pageshow',clean);window.FocusCalHeaderCleanup={clean,build:BUILD,preserved:[...PRESERVE]}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();