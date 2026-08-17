importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey:'AIzaSyAG3z8Uq40nGP1ofCcsFoMLcGZ4a4tsGhA',
  authDomain:'focuscal-connects.firebaseapp.com',
  projectId:'focuscal-connects',
  storageBucket:'focuscal-connects.firebasestorage.app',
  messagingSenderId:'570470010602',
  appId:'1:570470010602:web:4142ec4b57990c81581193'
});
const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{
  const n=payload.notification||{};
  self.registration.showNotification(n.title||'FocusCal',{body:n.body||'新しい更新があります',icon:'./icon-192.png',badge:'./icon-192.png',data:payload.data||{}});
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus'in w)return w.focus()}return clients.openWindow('./')}));
});
