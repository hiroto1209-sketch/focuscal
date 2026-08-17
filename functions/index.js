const {initializeApp}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getMessaging}=require('firebase-admin/messaging');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
initializeApp();
const db=getFirestore();
async function tokenFor(uid){if(!uid)return null;const s=await db.doc(`pushTokens/${uid}`).get();return s.exists?s.data().token:null}
async function send(uid,title,body,data={}){const token=await tokenFor(uid);if(!token)return;try{await getMessaging().send({token,notification:{title,body},data:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,String(v??'')]))})}catch(e){console.error('FCM send failed',uid,e.code||e.message);if(String(e.code||'').includes('registration-token-not-registered'))await db.doc(`pushTokens/${uid}`).delete().catch(()=>{})}}
exports.onPeekRequestCreated=onDocumentCreated('peekRequests/{id}',async event=>{const d=event.data?.data();if(!d||d.status!=='pending')return;await send(d.ownerUid,'FocusCal 👀','カレンダーを覗かせて頂く申請が届きました。',{kind:'peekRequest',requestId:event.params.id})});
exports.onSharedEventCreated=onDocumentCreated('spaceEvents/{id}',async event=>{const d=event.data?.data();if(!d?.spaceId)return;const s=await db.doc(`spaces/${d.spaceId}`).get();if(!s.exists)return;const members=s.data().memberUids||[];await Promise.all(members.filter(uid=>uid!==d.createdBy).map(uid=>send(uid,'FocusCal 🤝',`${d.date||''} ${d.title||'共同予定'} が追加されました。`,{kind:'spaceEvent',spaceId:d.spaceId,eventId:event.params.id})))});
