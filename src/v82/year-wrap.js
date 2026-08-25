(()=>{'use strict';
const BUILD='82';
let startX=null,startY=null,armed=false;
const monthText=()=>document.getElementById('month-display')?.textContent||'';
const isDec=()=>/12月/.test(monthText());
const isJan=()=>/(^|\D)1月/.test(monthText())&&!/11月|12月/.test(monthText());
function nextYearJan(){document.getElementById('yr-next')?.click();navigator.vibrate?.(8)}
function prevYearDec(){document.getElementById('yr-prev')?.click();for(let i=0;i<11;i++)document.getElementById('btn-next')?.click();navigator.vibrate?.(8)}
function bindArrows(){const n=document.getElementById('btn-next'),p=document.getElementById('btn-prev');if(n&&!n.dataset.fc82){n.dataset.fc82='1';n.addEventListener('click',e=>{if(!isDec())return;e.preventDefault();e.stopImmediatePropagation();nextYearJan()},true)}if(p&&!p.dataset.fc82){p.dataset.fc82='1';p.addEventListener('click',e=>{if(!isJan())return;e.preventDefault();e.stopImmediatePropagation();prevYearDec()},true)}}
function bindSwipe(){const wrap=document.getElementById('slider-wrap');if(!wrap||wrap.dataset.fc82)return;wrap.dataset.fc82='1';wrap.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;armed=true},{passive:true});wrap.addEventListener('pointerup',e=>{if(!armed||startX===null)return;const dx=e.clientX-startX,dy=e.clientY-startY;armed=false;startX=null;startY=null;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.15)return;if(dx<0&&isDec())setTimeout(nextYearJan,330);else if(dx>0&&isJan())setTimeout(prevYearDec,330)},{passive:true});wrap.addEventListener('pointercancel',()=>{armed=false;startX=null;startY=null},{passive:true})}
function clean(){bindArrows();bindSwipe();document.documentElement.dataset.fcYearWrapBuild=BUILD}
function boot(){clean();[100,300,700,1500,3000].forEach(ms=>setTimeout(clean,ms));window.addEventListener('pageshow',clean);window.FocusCalYearWrap={build:BUILD,nextYearJan,prevYearDec}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();