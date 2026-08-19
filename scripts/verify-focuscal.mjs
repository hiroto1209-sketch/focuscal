import fs from 'node:fs';
const mustExist=['index.html','app.html','firebase-config.js','push-config.js','peek.js','enhancements.js','ui-polish-v57.js','peek-calendar-v58.js','peek-appearance-live-v58.js','peek-cell-style-v59.js','feedback-v60.js','admin.html','admin-dashboard.js','ops.html','src/v70/ops-dashboard.js','src/v70/auto-planner.js','src/v70/account.js','src/v70/collaboration.js','src/v70/notifications.js','src/v70/observability.js','src/v76/feature-menu.js','functions/package.json','functions/index.js','firestore.rules','sw.js'];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),menu=read('src/v76/feature-menu.js'),sw=read('sw.js'),rules=read('firestore.rules'),feedback=read('feedback-v60.js'),planner=read('src/v70/auto-planner.js'),adminJs=read('admin-dashboard.js');
const checks=[
[index.includes("const BUILD='80'"),'index BUILD must be 80'],
[menu.includes("const BUILD='80'"),'feature menu BUILD must be 80'],
[menu.includes("mode:'v50-native-fab'"),'v50 FAB mode missing'],
[menu.includes('translateY(26px) scale(.4)'),'v50 pop origin missing'],
[menu.includes('cubic-bezier(.34,1.5,.5,1)'),'v50 spring easing missing'],
[menu.includes('rotate(135deg)'),'v50 main FAB rotation missing'],
[menu.includes('fab-label'),'v50 labels missing'],
[menu.includes('fab-fit')&&menu.includes('fab-book')&&menu.includes('fab-party'),'native v50 FABs must remain'],
[menu.includes('origin.click()'),'new feature proxies must invoke original actions'],
[!menu.includes('fc-v79-menu'),'legacy full-width feature menu must be removed'],
[planner.includes('@media(max-width:430px)'),'auto planner mobile breakpoint missing'],
[sw.includes('focuscal-v80-v50-fab'),'v80 service-worker cache missing'],
[rules.includes('match /feedback/{feedbackId}'),'Firestore feedback rule missing'],
[rules.includes('match /admins/{uid}'),'Firestore admin rule missing'],
[!rules.includes('allow read, write: if true'),'Unsafe Firestore allow-all rule detected'],
[feedback.includes("collection(db,'feedback')"),'Feedback must write to Firestore'],
[adminJs.includes('clusterStats'),'Feedback clustering missing'],
[read('src/v70/account.js').includes('linkWithPopup'),'Account linking missing'],
[read('src/v70/collaboration.js').includes("collection(db,'spaces')"),'Shared spaces missing'],
[read('src/v70/notifications.js').includes('getToken'),'FCM token registration missing']
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg)}
console.log(`FocusCal v80 integrity OK: ${mustExist.length} required files, v50 FAB behavior preserved with current features.`);