(() => {
  'use strict';

  const BUILD='56';
  const HOLIDAY_KEY='fc_holidays_enabled';
  const holidayEnabled=()=>localStorage.getItem(HOLIDAY_KEY)!=='0';
  const setHolidayEnabled=v=>localStorage.setItem(HOLIDAY_KEY,v?'1':'0');

  const STYLE=`
    .day-cell.fc-holiday .date-n:not(.today .date-n){color:#c98290!important}
    .fc-holiday-badge{
      position:absolute;top:4px;right:4px;z-index:3;
      min-width:18px;height:15px;padding:0 4px;border-radius:7px;
      display:flex;align-items:center;justify-content:center;
      border:1px solid rgba(220,112,132,.28);
      background:rgba(220,112,132,.07);
      color:rgba(232,142,158,.84);
      font-size:.42rem;font-weight:800;line-height:1;letter-spacing:.02em;
      pointer-events:none;
    }
    .fc-holiday-settings-note{font-size:.6rem;color:var(--muted);line-height:1.7;margin-top:8px}
    #peek-sheet{transition:transform .32s cubic-bezier(.32,.72,.33,1);will-change:transform}
    #peek-head{touch-action:none;cursor:grab}
    #peek-sheet.fc-peek-dragging{transition:none!important}
  `;

  function injectStyle(){
    if(document.getElementById('fc-enhancements-style'))return;
    const style=document.createElement('style');
    style.id='fc-enhancements-style';style.textContent=STYLE;document.head.appendChild(style);
  }

  function nthWeekday(year,month,weekday,n){
    const first=new Date(year,month,1).getDay();
    return 1+((weekday-first+7)%7)+(n-1)*7;
  }
  function vernalDay(year){return Math.floor(20.8431+0.242194*(year-1980)-Math.floor((year-1980)/4))}
  function autumnDay(year){return Math.floor(23.2488+0.242194*(year-1980)-Math.floor((year-1980)/4))}
  const key=(m,d)=>`${m}-${d}`;

  function japaneseHolidays(year){
    const national=new Map();
    const add=(m,d,name)=>national.set(key(m,d),{month:m,day:d,name,type:'national'});

    add(0,1,'元日');
    add(0,nthWeekday(year,0,1,2),'成人の日');
    add(1,11,'建国記念の日');
    if(year>=2020)add(1,23,'天皇誕生日');
    add(2,vernalDay(year),'春分の日');
    add(3,29,'昭和の日');
    add(4,3,'憲法記念日');
    add(4,4,'みどりの日');
    add(4,5,'こどもの日');
    add(6,nthWeekday(year,6,1,3),'海の日');
    add(7,11,'山の日');
    add(8,nthWeekday(year,8,1,3),'敬老の日');
    add(8,autumnDay(year),'秋分の日');
    add(9,nthWeekday(year,9,1,2),'スポーツの日');
    add(10,3,'文化の日');
    add(10,23,'勤労感謝の日');

    const all=new Map(national);

    // 祝日法第3条第3項：前後が「国民の祝日」の日は休日。
    const start=new Date(year,0,2),end=new Date(year,11,30);
    for(let dt=new Date(start);dt<=end;dt.setDate(dt.getDate()+1)){
      const m=dt.getMonth(),d=dt.getDate();
      if(national.has(key(m,d)))continue;
      const prev=new Date(year,m,d-1),next=new Date(year,m,d+1);
      if(national.has(key(prev.getMonth(),prev.getDate()))&&national.has(key(next.getMonth(),next.getDate()))){
        all.set(key(m,d),{month:m,day:d,name:'国民の休日',type:'citizen'});
      }
    }

    // 祝日法第3条第2項：日曜の国民の祝日の直後、最初の非祝日を振替休日にする。
    [...national.values()].forEach(h=>{
      const date=new Date(year,h.month,h.day);
      if(date.getDay()!==0)return;
      const sub=new Date(date);
      do{sub.setDate(sub.getDate()+1)}while(all.has(key(sub.getMonth(),sub.getDate())));
      if(sub.getFullYear()===year){
        all.set(key(sub.getMonth(),sub.getDate()),{month:sub.getMonth(),day:sub.getDate(),name:'振替休日',type:'substitute'});
      }
    });
    return all;
  }

  const holidayCache=new Map();
  function holidayFor(year,month,day){
    if(!holidayCache.has(year))holidayCache.set(year,japaneseHolidays(year));
    return holidayCache.get(year).get(key(month,day))||null;
  }

  function markHolidays(pageEl,month){
    if(!pageEl)return;
    pageEl.querySelectorAll('.fc-holiday-badge').forEach(el=>el.remove());
    pageEl.querySelectorAll('.day-cell.fc-holiday').forEach(el=>el.classList.remove('fc-holiday'));
    if(!holidayEnabled())return;
    const year=typeof YEAR==='number'?YEAR:new Date().getFullYear();
    pageEl.querySelectorAll('.day-cell:not(.empty)[data-d]').forEach(cell=>{
      const day=Number(cell.dataset.d);
      const h=holidayFor(year,month,day);if(!h)return;
      cell.classList.add('fc-holiday');
      cell.title=h.name;
      cell.setAttribute('aria-label',`${month+1}月${day}日 ${h.name}`);
      const badge=document.createElement('span');
      badge.className='fc-holiday-badge';badge.textContent='祝';badge.title=h.name;
      cell.appendChild(badge);
    });
  }

  function patchCalendar(){
    if(typeof window.buildGrid==='function'&&!window.buildGrid.__fcHolidayPatched){
      const original=window.buildGrid;
      const wrapped=function(pageEl,month){
        const out=original.apply(this,arguments);
        try{markHolidays(pageEl,month)}catch(e){console.warn('[FocusCal holidays]',e)}
        return out;
      };
      wrapped.__fcHolidayPatched=true;window.buildGrid=wrapped;
    }

    if(typeof window.openEventSheet==='function'&&!window.openEventSheet.__fcHolidayPatched){
      const original=window.openEventSheet;
      const wrapped=function(month,day){
        const out=original.apply(this,arguments);
        try{
          if(holidayEnabled()){
            const year=typeof YEAR==='number'?YEAR:new Date().getFullYear();
            const h=holidayFor(year,month,day);
            if(h){
              const label=document.getElementById('ev-date-label');
              if(label&&!label.querySelector('.fc-holiday-inline')){
                const span=document.createElement('span');span.className='fc-holiday-inline';
                span.textContent=` · ${h.name}`;span.style.cssText='font-size:.62rem;color:#c98290;font-weight:600;margin-left:3px';
                label.appendChild(span);
              }
            }
          }
        }catch(_){ }
        return out;
      };
      wrapped.__fcHolidayPatched=true;window.openEventSheet=wrapped;
    }
  }

  function mountHolidaySettings(){
    if(document.getElementById('fc-holiday-settings'))return;
    const week=document.getElementById('week-start-ctrl')?.closest('.settings-section');
    if(!week)return;
    const sec=document.createElement('div');sec.className='settings-section';sec.id='fc-holiday-settings';
    sec.innerHTML=`<div class="settings-section-label">日本の祝日</div>
      <div class="seg-control" id="fc-holiday-ctrl">
        <button class="seg-btn" data-v="1">表示する</button>
        <button class="seg-btn" data-v="0">表示しない</button>
      </div>
      <div class="fc-holiday-settings-note">祝日は日付の右上に小さく「祝」と表示します。カレンダーを邪魔しない控えめな表示です。</div>`;
    week.insertAdjacentElement('afterend',sec);
    const refresh=()=>sec.querySelectorAll('.seg-btn').forEach(b=>b.classList.toggle('active',(b.dataset.v==='1')===holidayEnabled()));
    sec.querySelectorAll('.seg-btn').forEach(b=>b.addEventListener('click',()=>{
      setHolidayEnabled(b.dataset.v==='1');refresh();
      try{if(typeof refreshPages==='function')refreshPages()}catch(_){ }
      navigator.vibrate?.(8);
    }));
    refresh();
  }

  function mountPeekDrag(){
    const sheet=document.getElementById('peek-sheet'),head=document.getElementById('peek-head'),close=document.getElementById('peek-close');
    if(!sheet||!head||!close||sheet.dataset.fcDrag==='1')return false;
    sheet.dataset.fcDrag='1';
    let startY=null,lastY=0,lastT=0,velocity=0,dy=0,pointerId=null;
    head.addEventListener('pointerdown',e=>{
      if(e.target.closest('button,input,textarea,select'))return;
      startY=e.clientY;lastY=e.clientY;lastT=performance.now();velocity=0;dy=0;pointerId=e.pointerId;
      sheet.classList.add('fc-peek-dragging');
      try{head.setPointerCapture(pointerId)}catch(_){ }
    });
    head.addEventListener('pointermove',e=>{
      if(startY===null)return;
      dy=Math.max(0,e.clientY-startY);
      const now=performance.now();velocity=(e.clientY-lastY)/Math.max(1,now-lastT);lastY=e.clientY;lastT=now;
      sheet.style.transform=`translateY(${dy}px)`;e.preventDefault();
    });
    const finish=()=>{
      if(startY===null)return;
      const shouldClose=dy>105||velocity>.55;
      startY=null;sheet.classList.remove('fc-peek-dragging');
      if(shouldClose){
        sheet.style.transform='translateY(105%)';
        setTimeout(()=>{try{close.click()}finally{sheet.style.transform=''}},220);
        navigator.vibrate?.(8);
      }else sheet.style.transform='';
    };
    head.addEventListener('pointerup',finish);head.addEventListener('pointercancel',finish);
    return true;
  }

  function ensurePeekDrag(){
    if(mountPeekDrag())return;
    const observer=new MutationObserver(()=>{if(mountPeekDrag())observer.disconnect()});
    observer.observe(document.documentElement,{subtree:true,childList:true});
    setTimeout(()=>observer.disconnect(),10000);
  }

  function selfCheck(){
    const checks={
      holiday2026_0101:holidayFor(2026,0,1)?.name==='元日',
      holiday2026_0506:holidayFor(2026,4,6)?.name==='振替休日',
      holiday2026_0922:holidayFor(2026,8,22)?.name==='国民の休日',
      holiday2027_0322:holidayFor(2027,2,22)?.name==='振替休日',
      settingsToggle:!!document.getElementById('fc-holiday-settings')
    };
    window.FOCUSCAL_ENHANCEMENT_CHECKS=checks;
    console.info('[FocusCal enhancements v'+BUILD+']',checks);
  }

  window.FocusCalHolidays={forYear:japaneseHolidays,get:holidayFor,enabled:holidayEnabled,build:BUILD};

  injectStyle();patchCalendar();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{mountHolidaySettings();ensurePeekDrag();setTimeout(selfCheck,250)},{once:true});
  }else{
    mountHolidaySettings();ensurePeekDrag();setTimeout(selfCheck,250);
  }
})();
