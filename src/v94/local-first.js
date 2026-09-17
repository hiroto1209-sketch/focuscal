(()=>{'use strict';
const VERSION='94',DB='focuscal-local-first',VER=1,STORE='records',META='meta',QUEUE='outbox';
let dbp=null;
function openDB(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains(STORE)){const s=d.createObjectStore(STORE,{keyPath:'key'});s.createIndex('kind','kind');s.createIndex('updatedAt','updatedAt')}if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'key'});if(!d.objectStoreNames.contains(QUEUE)){const q=d.createObjectStore(QUEUE,{keyPath:'id'});q.createIndex('createdAt','createdAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbp}
async function tx(store,mode,fn){const d=await openDB();return new Promise((resolve,reject)=>{const t=d.transaction(store,mode),s=t.objectStore(store);let result;try{result=fn(s)}catch(e){reject(e);return}t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error)})}
const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function put(kind,id,value,opts={}){const key=`${kind}:${id}`,row={key,kind,id,value,updatedAt:Date.now(),dirty:!!opts.dirty,deleted:false};await tx(STORE,'readwrite',s=>s.put(row));dispatchEvent(new CustomEvent('focuscal:local-change',{detail:row}));return row}
async function get(kind,id){return req((await openDB()).transaction(STORE).objectStore(STORE).get(`${kind}:${id}`)).then(x=>x?.deleted?null:x?.value??null)}
async function all(kind){const rows=await req((await openDB()).transaction(STORE).objectStore(STORE).index('kind').getAll(kind));return rows.filter(x=>!x.deleted).map(x=>x.value)}
async function remove(kind,id,opts={}){const key=`${kind}:${id}`;if(opts.dirty){await tx(STORE,'readwrite',s=>s.put({key,kind,id,value:null,updatedAt:Date.now(),dirty:true,deleted:true}))}else await tx(STORE,'readwrite',s=>s.delete(key));dispatchEvent(new CustomEvent('focuscal:local-change',{detail:{key,kind,id,deleted:true}}))}
async function enqueue(type,payload){const item={id:(crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`),type,payload,createdAt:Date.now(),tries:0};await tx(QUEUE,'readwrite',s=>s.put(item));dispatchEvent(new CustomEvent('focuscal:outbox-change',{detail:item}));return item}
async function outbox(){return req((await openDB()).transaction(QUEUE).objectStore(QUEUE).getAll())}
async function ack(id){return tx(QUEUE,'readwrite',s=>s.delete(id))}
async function setMeta(key,value){return tx(META,'readwrite',s=>s.put({key,value,updatedAt:Date.now()}))}
async function getMeta(key){const x=await req((await openDB()).transaction(META).objectStore(META).get(key));return x?.value}
async function snapshotLegacy(){const keys=['fc_events','focuscal_events','events','fc_quick_memos','focuscal_quick_memos'];for(const key of keys){try{const raw=localStorage.getItem(key);if(raw!=null)await setMeta(`legacy:${key}`,JSON.parse(raw))}catch{}}await setMeta('lastSnapshotAt',Date.now())}
async function flush(){if(!navigator.onLine)return false;const q=await outbox();if(!q.length)return true;dispatchEvent(new CustomEvent('focuscal:local-first-sync',{detail:{items:q,ack}}));return true}
function network(){document.documentElement.dataset.fcNetwork=navigator.onLine?'online':'offline';dispatchEvent(new CustomEvent('focuscal:network-change',{detail:{online:navigator.onLine}}));if(navigator.onLine)flush()}
addEventListener('online',network);addEventListener('offline',network);
window.FocusCalLocalFirst={version:VERSION,put,get,all,remove,enqueue,outbox,ack,setMeta,getMeta,snapshotLegacy,flush,isOnline:()=>navigator.onLine,ready:()=>openDB()};
(async()=>{try{await openDB();await snapshotLegacy();network();dispatchEvent(new CustomEvent('focuscal:local-first-ready',{detail:{version:VERSION}}))}catch(e){console.error('[FocusCal LocalFirst]',e)}})();
})();