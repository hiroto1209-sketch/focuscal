(()=>{'use strict';
const BUILD='72';
const PRESERVE=new Set(['btn-today','btn-prev','btn-next','btn-undo','btn-redo','settings-btn']);
const LABELS={
  'feedback-btn':'フィードバック','fc-feedback-btn':'フィードバック',
  'peek-btn':'覗かせて頂く','fc-peek-btn':'覗かせて頂く',
  'fc-ai-btn':'自動予定最適化','fc-account-btn':'アカウント',
  'fc-collab-btn':'共同スペース','fc-notify-btn':'通知センター',
  'pb-open':'フレーズ帳','fit-open':'筋トレ記録','party-open':'お祝い'
};
const CSS=`
#header-row{overflow:visible!important}
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;order:99!important}
#fab-wrap .fc-v72-action{display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important}
#fab-wrap .fc-v72-action .fab-label{pointer-events:none}
@media(max-width:520px){#fab-wrap .fc-v72-action{width:54px;height:54px;border-radius:50%;font-size:1.18rem}}
`;
function style(){if(document.getElementById('fc-v72-header-style'))return;const s=document.createElement('style');s.id='fc-v72-header-style';s.textContent=CSS;document.head.appendChild(s)}
function fabWrap(){return document.getElementById('fab-wrap')||document.getElementById('fab-menu')||document.querySelector('.fab-wrap')||document.getElementById('fab-container')}
function labelFor(b){return LABELS[b.id]||b.getAttribute('aria-label')||b.title||'機能'}
function iconText(b){for(const n of b.childNodes){if(n.nodeType===Node.TEXT_NODE&&n.textContent.trim())return n.textContent.trim()}return (b.textContent||'').trim().replace(labelFor(b),'').trim()||'•'}
function move(b){if(!b||PRESERVE.has(b.id)||b.id==='fab-main'||b.dataset.fcV72Moved==='1')return;const wrap=fabWrap(),main=document.getElementById('fab-main');if(!wrap||!main)return;b.dataset.fcV72Moved='1';const icon=iconText(b);b.classList.remove('nav-btn');b.classList.add('fab-item','fc-v72-action');if(!b.querySelector('.fab-label')){const sp=document.createElement('span');sp.className='fab-label';sp.textContent=labelFor(b);b.appendChild(sp)}wrap.insertBefore(b,main);b.setAttribute('data-fc-secondary-action','1');if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',labelFor(b));}
function clean(){style();const header=document.getElementById('header-row');if(!header)return;const settings=document.getElementById('settings-btn');if(settings){settings.hidden=false;settings.style.removeProperty('display');settings.style.removeProperty('visibility');settings.style.removeProperty('opacity')}
  // Strong rule: every header button except calendar navigation + Settings is a secondary feature.
  [...header.querySelectorAll('button')].forEach(move);
  // Also catch feature buttons inserted elsewhere beside Settings by older modules.
  document.querySelectorAll('.nav-btn').forEach(b=>{if(!PRESERVE.has(b.id)&&!header.contains(b))move(b)});
  Object.keys(LABELS).forEach(id=>{const b=document.getElementById(id);if(b&&!PRESERVE.has(id))move(b)});
}
function boot(){clean();let t;const mo=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(clean,20)});mo.observe(document.body,{subtree:true,childList:true});[100,300,700,1400,2600].forEach(ms=>setTimeout(clean,ms));window.FocusCalHeaderCleanup={clean,build:BUILD,preserved:[...PRESERVE]}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();