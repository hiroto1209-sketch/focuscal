(()=>{'use strict';
const BUILD='71';
const LABELS={
  'feedback-btn':'フィードバック','fc-feedback-btn':'フィードバック',
  'peek-btn':'覗かせて頂く','fc-peek-btn':'覗かせて頂く',
  'fc-ai-btn':'自動予定最適化','fc-account-btn':'アカウント',
  'fc-collab-btn':'共同スペース','fc-notify-btn':'通知センター'
};
const CSS=`
/* v71: keep the calendar header quiet. Settings is the only secondary action kept above. */
#settings-btn{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important}
.fc-v71-action{position:relative!important}
#fab-wrap .fc-v71-action{display:flex;align-items:center;justify-content:center}
#fab-wrap .fc-v71-action .fab-label{pointer-events:none}
@media(max-width:520px){
  #fab-wrap .fc-v71-action{width:54px;height:54px;border-radius:50%;font-size:1.18rem}
  #fab-wrap .fc-v71-action .fab-label{font-size:.62rem}
}
`;
function injectStyle(){if(document.getElementById('fc-v71-action-style'))return;const s=document.createElement('style');s.id='fc-v71-action-style';s.textContent=CSS;document.head.appendChild(s)}
function getWrap(){return document.getElementById('fab-wrap')||document.getElementById('fab-menu')||document.querySelector('.fab-wrap')||document.getElementById('fab-container')}
function labelFor(btn){return LABELS[btn.id]||btn.getAttribute('aria-label')||btn.title||'機能'}
function moveButton(btn){
  if(!btn||btn.id==='settings-btn'||btn.id==='fab-main'||btn.dataset.fcV71Moved==='1')return;
  const wrap=getWrap(),main=document.getElementById('fab-main');if(!wrap||!main)return;
  btn.dataset.fcV71Moved='1';
  btn.classList.remove('nav-btn');btn.classList.add('fab-item','fc-v71-action');
  const text=(btn.textContent||'').trim();
  // Keep only the icon already rendered by the feature button, then add the same label treatment as native FAB items.
  if(!btn.querySelector('.fab-label')){const span=document.createElement('span');span.className='fab-label';span.textContent=labelFor(btn);btn.appendChild(span)}
  wrap.insertBefore(btn,main);
  btn.setAttribute('data-fc-secondary-action','1');
}
function tidy(){
  injectStyle();
  const settings=document.getElementById('settings-btn');if(settings){settings.style.removeProperty('display');settings.hidden=false}
  document.querySelectorAll('.nav-btn').forEach(moveButton);
  // Some older extensions create icon buttons without nav-btn. Move only known secondary ids.
  Object.keys(LABELS).forEach(id=>{const b=document.getElementById(id);if(b&&b.id!=='settings-btn')moveButton(b)});
}
function boot(){tidy();let pending=0;const mo=new MutationObserver(()=>{clearTimeout(pending);pending=setTimeout(tidy,30)});mo.observe(document.body,{subtree:true,childList:true});setTimeout(tidy,250);setTimeout(tidy,900);window.FocusCalActionMenu={tidy,build:BUILD}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();