(()=>{'use strict';
const BUILD='84';
let startX=null,startY=null,armed=false,busy=false,prepared=null,internal=false;
const monthText=()=>document.getElementById('month-display')?.textContent||'';
function currentMonth(){const m=monthText().match(/(1[0-2]|[1-9])月\s*$/);return m?Number(m[1])-1:null}
const isDec=()=>currentMonth()===11;
const isJan=()=>currentMonth()===0;
const slider=()=>document.getElementById('slider');
const wrap=()=>document.getElementById('slider-wrap');
const pageCur=()=>document.getElementById('page-cur');
const pagePrev=()=>document.getElementById('page-prev');
const pageNext=()=>document.getElementById('page-next');
const width=()=>wrap()?.offsetWidth||innerWidth;
function click(id){document.getElementById(id)?.click()}
function setMonth(target){let guard=20,m=currentMonth();while(m!==null&&m<target&&guard--){click('btn-next');m=currentMonth()}guard=20;while(m!==null&&m>target&&guard--){click('btn-prev');m=currentMonth()}}
function changeYear(delta,targetMonth){internal=true;try{click(delta>0?'yr-next':'yr-prev');setMonth(targetMonth)}finally{internal=false}}
function snapshotBoundary(dir){if(busy)return false;const m=currentMonth();if((dir>0&&m!==11)||(dir<0&&m!==0))return false;const target=dir>0?pageNext():pagePrev(),cur=pageCur();if(!target||!cur)return false;
  const originalMonth=m;let html='';internal=true;
  try{
    click(dir>0?'yr-next':'yr-prev');setMonth(dir>0?0:11);html=cur.innerHTML;
    click(dir>0?'yr-prev':'yr-next');setMonth(originalMonth);
  }finally{internal=false}
  target.innerHTML=html;prepared={dir,month:originalMonth};return true
}
function resetSlider(){const s=slider();if(!s)return;s.style.transition='none';s.style.transform=`translateX(${-width()}px)`;void s.offsetWidth}
function finishCross(dir){changeYear(dir,dir>0?0:11);resetSlider();prepared=null;busy=false;navigator.vibrate?.(8)}
function currentSliderX(){const s=slider();if(!s)return-width();const raw=s.style.transform||'';const m=raw.match(/translateX\((-?[\d.]+)px\)/);return m?Number(m[1]):-width()}
function animateCross(dir,startAt=null){if(busy)return;const m=currentMonth();if((dir>0&&m!==11)||(dir<0&&m!==0))return;const s=slider();if(!s)return;
  // Prepare the adjacent year's month only after the gesture direction is known.
  // This avoids re-rendering the calendar on pointerdown, which used to break 12→11 and 1→2 native swipes.
  if(!prepared||prepared.dir!==dir){const keepX=startAt??currentSliderX();snapshotBoundary(dir);s.style.transition='none';s.style.transform=`translateX(${keepX}px)`;void s.offsetWidth}
  busy=true;const w=width();requestAnimationFrame(()=>{s.style.transition='transform .36s cubic-bezier(.32,.72,.33,1)';s.style.transform=`translateX(${dir>0?-w*2:0}px)`});setTimeout(()=>finishCross(dir),370)
}
function bindArrows(){const n=document.getElementById('btn-next'),p=document.getElementById('btn-prev');if(n&&!n.dataset.fc84){n.dataset.fc84='1';n.addEventListener('click',e=>{if(internal||!isDec())return;e.preventDefault();e.stopImmediatePropagation();animateCross(1,-width())},true)}if(p&&!p.dataset.fc84){p.dataset.fc84='1';p.addEventListener('click',e=>{if(internal||!isJan())return;e.preventDefault();e.stopImmediatePropagation();animateCross(-1,-width())},true)}}
function bindSwipe(){const w=wrap();if(!w||w.dataset.fc84)return;w.dataset.fc84='1';
  // IMPORTANT: pointerdown must not mutate year/month/DOM. Native intra-year swipes own the gesture.
  w.addEventListener('pointerdown',e=>{if(busy)return;startX=e.clientX;startY=e.clientY;armed=true},{capture:true,passive:true});
  w.addEventListener('pointerup',e=>{if(!armed||startX===null)return;const dx=e.clientX-startX,dy=e.clientY-startY;armed=false;startX=null;startY=null;if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.15)return;const dir=dx<0?1:-1;
    const crossing=(dir>0&&isDec())||(dir<0&&isJan());
    if(!crossing)return; // Let the original calendar handle 12→11, 1→2 and every normal month swipe untouched.
    const dragX=currentSliderX();e.stopImmediatePropagation();e.preventDefault();animateCross(dir,dragX)
  },{capture:true,passive:false});
  const cancel=()=>{armed=false;startX=null;startY=null;prepared=null};w.addEventListener('pointercancel',cancel,{capture:true,passive:true});
}
function clean(){bindArrows();bindSwipe();document.documentElement.dataset.fcYearWrapBuild=BUILD}
function boot(){clean();[100,300,700,1500,3000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalYearWrap={build:BUILD,currentMonth,animateCross,snapshotBoundary}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();