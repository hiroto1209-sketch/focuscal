import fs from 'node:fs';
const mustExist=['index.html','app.html','firebase-config.js','push-config.js','peek.js','enhancements.js','ui-polish-v57.js','feedback-v60.js','admin.html','admin-dashboard.js','ops.html','src/v70/ops-dashboard.js','src/v70/account.js','src/v70/collaboration.js','src/v70/notifications.js','src/v70/observability.js','src/v76/feature-menu.js','src/v82/year-wrap.js','src/v90/faithful-peek-lite.js','functions/package.json','functions/index.js','firestore.rules','sw.js'];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),menu=read('src/v76/feature-menu.js'),sw=read('sw.js'),rules=read('firestore.rules'),feedback=read('feedback-v60.js'),adminJs=read('admin-dashboard.js'),peek90=read('src/v90/faithful-peek-lite.js'),legacyPeek=read('peek.js');
const checks=[
[index.includes("const BUILD='90'"),'index BUILD must be 90'],
[index.includes('src/v90/faithful-peek-lite.js'),'v90 lightweight peek loader missing'],
[!index.includes('<script defer src="./src/v89/faithful-peek.js'),'v89 self-healing renderer must not load'],
[!index.includes('<script defer src="./peek-calendar-v58.js'),'legacy mirror renderer must not load'],
[!index.includes('<script defer src="./peek-cell-style-v59.js'),'legacy cell decorator must not load'],
[menu.includes("mode:'v50-native-fab'"),'v50 FAB mode missing'],
[menu.includes('translateY(26px) scale(.4)'),'v50 pop origin missing'],
[menu.includes('rotate(135deg)'),'v50 main FAB rotation missing'],
[!index.includes('<script defer src="./src/v70/auto-planner.js'),'auto planner must stay removed'],
[peek90.includes("mode:'single-listener-lightweight'"),'single-listener lightweight mode missing'],
[peek90.includes('stopImmediatePropagation'),'legacy calendar listener suppression missing'],
[peek90.includes('lastSig'),'duplicate render suppression missing'],
[peek90.includes('contain:layout paint style'),'render containment missing'],
[peek90.includes('fx-neon')&&peek90.includes('fx-fire')&&peek90.includes('fx-aurora'),'lightweight cell effects missing'],
[!peek90.includes('ownerWatches'),'owner watchdogs must be removed'],
[!peek90.includes('publishMonth'),'duplicate mirror publisher must be removed'],
[legacyPeek.includes('{merge:true}'),'peek sync must preserve canonical document fields'],
[legacyPeek.includes('color,effect'),'peek sync must publish cell visuals'],
[legacyPeek.includes('fc_peek_sync_'),'peek sync hash cache missing'],
[sw.includes('focuscal-v90-lightweight-faithful-peek'),'v90 service-worker cache missing'],
[rules.includes('match /events/{eventId}'),'Firestore events rule missing'],
[rules.includes('match /feedback/{feedbackId}'),'Firestore feedback rule missing'],
[!rules.includes('allow read, write: if true'),'Unsafe Firestore allow-all rule detected'],
[feedback.includes("collection(db,'feedback')"),'Feedback must write to Firestore'],
[adminJs.includes('clusterStats'),'Feedback clustering missing'],
[read('src/v70/account.js').includes('linkWithPopup'),'Account linking missing'],
[read('src/v70/collaboration.js').includes("collection(db,'spaces')"),'Shared spaces missing'],
[read('src/v70/notifications.js').includes('getToken'),'FCM token registration missing']
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg)}
console.log(`FocusCal v90 integrity OK: ${mustExist.length} required files, lightweight faithful peek and v50 FAB preserved.`);