(() => {
  'use strict';

  const BUILD='57';
  const STYLE=`
    /* Holiday badge: keep it unmistakable but never overlap the date number. */
    .day-cell.fc-holiday{position:relative}
    .day-cell.fc-holiday .fc-holiday-badge{
      top:5px!important;right:5px!important;
      min-width:0!important;width:12px!important;height:12px!important;padding:0!important;
      border-radius:999px!important;
      font-size:7px!important;line-height:12px!important;font-weight:800!important;
      border:1px solid rgba(220,112,132,.26)!important;
      background:rgba(220,112,132,.08)!important;
      color:rgba(235,145,162,.88)!important;
      box-shadow:none!important;
      opacity:.9!important;
    }
    .day-cell.fc-holiday .date-n{padding-right:0!important}

    /* Shared bottom-sheet handle used by Peek and any compatible sheet. */
    .fc-sheet-handle-wrap{
      height:28px;display:flex;align-items:center;justify-content:center;
      flex:0 0 28px;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;
    }
    .fc-sheet-handle{
      width:48px;height:5px;border-radius:999px;
      background:rgba(133,119,199,.34);
      box-shadow:0 0 0 1px rgba(255,255,255,.015) inset;
    }
    .fc-sheet-handle-wrap:active{cursor:grabbing}
    .fc-sheet-gesture-target{
      transition:transform .30s cubic-bezier(.32,.72,.33,1)!important;
      will-change:transform;
    }
    .fc-sheet-gesture-target.fc-sheet-dragging{transition:none!important}
  `;

  function injectStyle(){
    if(document.getElementById('fc-ui-polish-v57'))return;
    const s=document.createElement('style');
    s.id='fc-ui-polish-v57';s.textContent=STYLE;document.head.appendChild(s);
  }

  function ensureHandle(sheet, preferredHead){
    if(!sheet||sheet.querySelector(':scope > .fc-sheet-handle-wrap'))return sheet?.querySelector(':scope > .fc-sheet-handle-wrap')||null;
    const handle=document.createElement('div');
    handle.className='fc-sheet-handle-wrap';
    handle.setAttribute('role','button');
    handle.setAttribute('aria-label','下にスワイプして閉じる');
    handle.innerHTML='<div class="fc-sheet-handle"></div>';
    if(preferredHead&&preferredHead.parentNode===sheet)sheet.insertBefore(handle,preferredHead);
    else sheet.insertBefore(handle,sheet.firstChild);
    return handle;
  }

  function findCloseControl(sheet){
    if(!sheet)return null;
    const exact=sheet.querySelector('#peek-close,[data-sheet-close],.sheet-close,.close-btn,button[aria-label="閉じる"]');
    if(exact)return exact;
    return [...sheet.querySelectorAll('button')].find(b=>['×','✕','✖'].includes((b.textContent||'').trim()))||null;
  }

  function closeSheet(sheet,closeControl){
    if(closeControl){closeControl.click();return}
    const overlay=sheet.parentElement;
    if(overlay){overlay.classList.remove('open','show','active');overlay.setAttribute('aria-hidden','true')}
  }

  function attachGesture(sheet,handle,closeControl){
    if(!sheet||!handle||sheet.dataset.fcUnifiedGesture==='1')return false;
    sheet.dataset.fcUnifiedGesture='1';sheet.classList.add('fc-sheet-gesture-target');
    let startY=null,lastY=0,lastT=0,velocity=0,dy=0,pointerId=null;

    const reset=()=>{sheet.classList.remove('fc-sheet-dragging');sheet.style.transform=''};
    const finish=()=>{
      if(startY===null)return;
      const height=Math.max(1,sheet.getBoundingClientRect().height);
      const shouldClose=dy>Math.min(140,height*.22)||velocity>.58;
      startY=null;sheet.classList.remove('fc-sheet-dragging');
      if(shouldClose){
        sheet.style.transform='translateY(105%)';
        setTimeout(()=>{try{closeSheet(sheet,closeControl)}finally{sheet.style.transform=''}},190);
        try{navigator.vibrate?.(8)}catch(_){ }
      }else reset();
    };

    handle.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      startY=e.clientY;lastY=e.clientY;lastT=performance.now();velocity=0;dy=0;pointerId=e.pointerId;
      sheet.classList.add('fc-sheet-dragging');
      try{handle.setPointerCapture(pointerId)}catch(_){ }
    });
    handle.addEventListener('pointermove',e=>{
      if(startY===null)return;
      dy=Math.max(0,e.clientY-startY);
      const now=performance.now();velocity=(e.clientY-lastY)/Math.max(1,now-lastT);lastY=e.clientY;lastT=now;
      sheet.style.transform=`translateY(${dy}px)`;e.preventDefault();
    },{passive:false});
    handle.addEventListener('pointerup',finish);
    handle.addEventListener('pointercancel',finish);
    return true;
  }

  function enhancePeek(){
    const sheet=document.getElementById('peek-sheet');
    if(!sheet)return false;
    const head=document.getElementById('peek-head');
    const handle=ensureHandle(sheet,head);
    const close=document.getElementById('peek-close')||findCloseControl(sheet);
    attachGesture(sheet,handle,close);
    return true;
  }

  function enhanceCompatibleSheets(){
    const candidates=new Set([
      ...document.querySelectorAll('[id$="-sheet"],.bottom-sheet,.modal-sheet,.sheet-panel')
    ]);
    candidates.forEach(sheet=>{
      if(sheet.id==='peek-sheet')return;
      const overlay=sheet.parentElement;
      if(!overlay)return;
      const computed=getComputedStyle(overlay);
      const likelyModal=computed.position==='fixed'||overlay.classList.contains('overlay')||overlay.classList.contains('modal-overlay');
      if(!likelyModal)return;
      const existing=sheet.querySelector(':scope > .drag-handle,:scope > .sheet-handle,:scope > .handle,:scope > .fc-sheet-handle-wrap');
      const handle=existing||ensureHandle(sheet,sheet.firstElementChild);
      attachGesture(sheet,handle,findCloseControl(sheet));
    });
  }

  function run(){
    injectStyle();
    enhancePeek();enhanceCompatibleSheets();
    const obs=new MutationObserver(()=>{enhancePeek();enhanceCompatibleSheets()});
    obs.observe(document.documentElement,{subtree:true,childList:true});
    setTimeout(()=>obs.disconnect(),15000);
    window.FocusCalSheetGestures={attach:attachGesture,ensureHandle,build:BUILD};
    window.FOCUSCAL_UI_POLISH_BUILD=BUILD;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
