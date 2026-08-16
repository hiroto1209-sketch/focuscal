(() => {
  'use strict';
  const BUILD='58';
  let timer=null;
  const readSettings=()=>{try{return JSON.parse(localStorage.getItem('fc_settings'))||{}}catch(_){return{}}};
  const currentAppearance=()=>{const s=readSettings();return{theme:s.theme||'violet',bgTint:s.bgTint||'default',weekStart:Number(s.weekStart)||0,holidaysEnabled:localStorage.getItem('fc_holidays_enabled')!=='0'}};
  async function publishAppearance(){
    const cfg=window.FOCUSCAL_FIREBASE_CONFIG;if(!cfg)return;
    try{
      const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,doc,setDoc,serverTimestamp}]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const app=getApps().length?getApp():initializeApp(cfg),auth=getAuth(app);if(!auth.currentUser)await signInAnonymously(auth);const db=getFirestore(app),uid=auth.currentUser.uid,y=Number(localStorage.getItem('fc_active_year'))||new Date().getFullYear(),a=currentAppearance();
      const jobs=[];for(let m=0;m<12;m++){if(localStorage.getItem(`fc_${y}_${m}`)!=null)jobs.push(setDoc(doc(db,'events',`${uid}_${y}_${m}`),{appearance:a,mirrorBuild:BUILD,appearanceUpdatedAt:serverTimestamp()},{merge:true}))}await Promise.allSettled(jobs);
    }catch(e){console.warn('[Peek appearance live]',e)}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(publishAppearance,420)}
  function hook(){if(Storage.prototype.setItem.__fcAppearance58)return;const prev=Storage.prototype.setItem;const wrapped=function(k,v){const r=prev.call(this,k,v);if(k==='fc_settings'||k==='fc_holidays_enabled')schedule();return r};wrapped.__fcAppearance58=true;Storage.prototype.setItem=wrapped}
  function run(){hook();window.FOCUSCAL_PEEK_APPEARANCE_BUILD=BUILD}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
