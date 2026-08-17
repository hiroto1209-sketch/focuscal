(() => {
  'use strict';
  const BUILD='70';
  const cfg=window.FOCUSCAL_FIREBASE_CONFIG;
  const qs=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const severityScore={critical:100,high:60,normal:20};
  const categoryScore={bug:20,speed:16,ui:10,idea:6};
  const labels={bug:'🐛 不具合',idea:'💡 アイデア',ui:'🎨 UI',speed:'⚡ 速度'};
  const statuses={new:'新着',investigating:'調査中',planned:'対応予定',resolved:'解決済み',wontfix:'見送り'};
  let db,auth,fns,items=[];
  const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[\s\p{P}\p{S}]+/gu,'').slice(0,80);
  function clusterKey(x){return `${x.category||'other'}:${norm(x.title||x.message)}`}
  function clusterStats(x){const k=clusterKey(x),same=items.filter(y=>clusterKey(y)===k);return{count:same.length,users:new Set(same.map(y=>y.authorUid).filter(Boolean)).size,builds:new Set(same.map(y=>y.build).filter(Boolean)).size}}
  function autoScore(x){const c=clusterStats(x);return (severityScore[x.severity]||20)+(categoryScore[x.category]||0)+Math.min(90,Math.max(0,c.count-1)*15)+Math.min(25,Math.max(0,c.users-1)*5)+(c.builds>=2?10:0)}
  function score(x){return Number(x.priorityScore??autoScore(x))}
  function fmt(ts){try{const d=ts?.toDate?ts.toDate():new Date(ts||Date.now());return new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}catch(_){return'-'}}
  function counts(){const active=items.filter(x=>(x.status||'new')!=='resolved'&&(x.status||'new')!=='wontfix');return{all:items.length,critical:active.filter(x=>x.severity==='critical').length,new:active.filter(x=>(x.status||'new')==='new').length,resolved:items.filter(x=>x.status==='resolved').length}}
  function render(){
    const filter=qs('#filter-status').value,cat=qs('#filter-category').value,q=qs('#search').value.trim().toLowerCase();
    let list=items.filter(x=>(filter==='all'||(x.status||'new')===filter)&&(cat==='all'||x.category===cat));
    if(q)list=list.filter(x=>`${x.title} ${x.message} ${x.steps}`.toLowerCase().includes(q));
    list.sort((a,b)=>score(b)-score(a)||((b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
    const c=counts();qs('#stat-all').textContent=c.all;qs('#stat-critical').textContent=c.critical;qs('#stat-new').textContent=c.new;qs('#stat-resolved').textContent=c.resolved;
    qs('#feedback-list').innerHTML=list.length?list.map(card).join(''):'<div class="empty">条件に一致するフィードバックはありません。</div>';
    qs('#feedback-list').querySelectorAll('[data-id]').forEach(el=>bindCard(el));
  }
  function card(x){const st=x.status||'new',s=score(x),cl=clusterStats(x);return `<article class="card ${x.severity==='critical'?'critical':''}" data-id="${esc(x.id)}">
    <div class="card-top"><div class="badges"><span class="badge type">${labels[x.category]||x.category}</span><span class="badge sev ${esc(x.severity)}">${esc(x.severity)}</span><span class="badge status">${statuses[st]||st}</span><span class="score">P${s}</span>${cl.count>1?`<span class="badge status">同系統×${cl.count}</span>`:''}</div><span class="time">${fmt(x.createdAt)}</span></div>
    <h3>${esc(x.title||'無題のフィードバック')}</h3><p class="message">${esc(x.message||'')}</p>${x.steps?`<details><summary>再現手順・補足</summary><pre>${esc(x.steps)}</pre></details>`:''}
    <div class="meta">build ${esc(x.build||'-')} · ${esc(x.viewport||'-')} · ${esc(x.platform||'-')} · 報告者 ${cl.users||1}人 · 影響build ${cl.builds||1}</div>
    <div class="actions"><select class="status-select">${Object.entries(statuses).map(([k,v])=>`<option value="${k}" ${k===st?'selected':''}>${v}</option>`).join('')}</select><input class="priority" type="number" min="0" max="999" value="${s}" aria-label="優先度"><button class="save">更新</button></div>
    <textarea class="note" placeholder="開発メモ（例：v71で修正予定）">${esc(x.adminNote||'')}</textarea>
  </article>`}
  function bindCard(el){const id=el.dataset.id;el.querySelector('.save').onclick=async()=>{const b=el.querySelector('.save');b.disabled=true;b.textContent='保存中';try{await fns.updateDoc(fns.doc(db,'feedback',id),{status:el.querySelector('.status-select').value,priorityScore:Number(el.querySelector('.priority').value)||0,adminNote:el.querySelector('.note').value.slice(0,2000),updatedAt:fns.serverTimestamp()});b.textContent='保存済み';setTimeout(()=>b.textContent='更新',900)}catch(e){console.error(e);b.textContent='失敗';alert('更新できません。Firestore Rules と admin 設定を確認してください。')}finally{b.disabled=false}}}
  async function boot(){
    if(!cfg){qs('#gate').innerHTML='<b>Firebase設定がありません。</b>';return}
    const [{initializeApp,getApps,getApp},{getAuth,signInAnonymously},{getFirestore,collection,onSnapshot,query,limit,doc,updateDoc,serverTimestamp,getDoc}]=await Promise.all([import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')]);
    const app=getApps().length?getApp():initializeApp(cfg);auth=getAuth(app);if(!auth.currentUser)await signInAnonymously(auth);db=getFirestore(app);fns={collection,onSnapshot,query,limit,doc,updateDoc,serverTimestamp,getDoc};
    const uid=auth.currentUser.uid;qs('#admin-uid').textContent=uid;qs('#copy-uid').onclick=()=>navigator.clipboard?.writeText(uid);
    try{const admin=await getDoc(doc(db,'admins',uid));if(!admin.exists()){qs('#gate').classList.remove('hidden');qs('#dashboard').classList.add('hidden');return}}catch(e){qs('#gate').classList.remove('hidden');qs('#dashboard').classList.add('hidden');return}
    qs('#gate').classList.add('hidden');qs('#dashboard').classList.remove('hidden');
    onSnapshot(query(collection(db,'feedback'),limit(500)),snap=>{items=snap.docs.map(d=>({id:d.id,...d.data()}));render()},e=>{console.error(e);qs('#feedback-list').innerHTML='<div class="empty">Feedbackを取得できません。Rulesを確認してください。</div>'});
    ['#filter-status','#filter-category','#search'].forEach(s=>qs(s).addEventListener(s==='#search'?'input':'change',render));
  }
  window.addEventListener('DOMContentLoaded',()=>boot().catch(e=>{console.error(e);qs('#gate').innerHTML='<b>ダッシュボード起動に失敗しました。</b><div class="hint">再読み込みしてください。</div>'}));
})();