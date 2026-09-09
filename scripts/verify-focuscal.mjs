import fs from 'node:fs';
const mustExist=['index.html','app.html','firebase-config.js','push-config.js','peek.js','enhancements.js','ui-polish-v57.js','feedback-v60.js','admin.html','admin-dashboard.js','ops.html','src/v70/ops-dashboard.js','src/v70/account.js','src/v70/collaboration.js','src/v70/notifications.js','src/v70/observability.js','src/v76/feature-menu.js','src/v82/year-wrap.js','src/v88/faithful-peek.js','functions/package.json','functions/index.js','firestore.rules','sw.js'];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),menu=read('src/v76/feature-menu.js'),sw=read('sw.js'),rules=read('firestore.rules'),feedback=read('feedback-v60.js'),adminJs=read('admin-dashboard.js'),peek88=read('src/v88/faithful-peek.js');
const checks=[
[index.includes("const BUILD='88'"),'index BUILD must be 88'],
[index.includes('src/v88/faithful-peek.js'),'v88 faithful peek loader missing'],
[!index.includes('<script defer src="./peek-calendar-v58.js'),'legacy mirror renderer must not load'],
[!index.includes('<script defer src="./peek-cell-style-v59.js'),'legacy cell decorator must not load'],
[!index.includes('<script defer src="./src/v85/peek-share-refinement.js'),'v85 mirror decorator must not load'],
[!index.includes('<script defer src="./src/v87/faithful-peek.js'),'v87 mirror decorator must not load'],
[menu.includes("mode:'v50-native-fab'"),'v50 FAB mode missing'],
[menu.includes('translateY(26px) scale(.4)'),'v50 pop origin missing'],
[menu.includes('rotate(135deg)'),'v50 main FAB rotation missing'],
[menu.includes('fab-fit')&&menu.includes('fab-book')&&menu.includes('fab-party'),'native v50 FABs must remain'],
[!index.includes('<script defer src="./src/v70/auto-planner.js'),'auto planner must stay removed from runtime'],
[peek88.includes('mirrorV88'),'v88 mirror field missing'],
[peek88.includes('ownerUid:auth.currentUser.uid'),'mirror writes must satisfy Firestore create ownership rule'],
[peek88.includes('snapshotMonth'),'visual snapshot publisher missing'],
[peek88.includes('localWeekStart'),'viewer-side week start missing'],
[peek88.includes('protectRenderer'),'renderer protection against legacy DOM rewrites missing'],
[peek88.includes("mode:'canonical-single-renderer'"),'canonical renderer mode missing'],
[peek88.includes('fx-neon')&&peek88.includes('fx-fire')&&peek88.includes('fx-aurora'),'cell effects missing'],
[sw.includes('focuscal-v88-canonical-faithful-peek'),'v88 service-worker cache missing'],
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
console.log(`FocusCal v88 integrity OK: ${mustExist.length} required files, canonical faithful peek and v50 FAB preserved.`);