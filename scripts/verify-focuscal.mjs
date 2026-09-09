import fs from 'node:fs';
const mustExist=['index.html','app.html','firebase-config.js','push-config.js','peek.js','enhancements.js','ui-polish-v57.js','feedback-v60.js','admin.html','admin-dashboard.js','ops.html','src/v70/ops-dashboard.js','src/v70/account.js','src/v70/collaboration.js','src/v70/notifications.js','src/v70/observability.js','src/v76/feature-menu.js','src/v82/year-wrap.js','src/v91/peek-visual-sync.js','src/v91/faithful-peek-lite.js','functions/package.json','functions/index.js','firestore.rules','sw.js'];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),menu=read('src/v76/feature-menu.js'),sw=read('sw.js'),rules=read('firestore.rules'),feedback=read('feedback-v60.js'),adminJs=read('admin-dashboard.js'),peek91=read('src/v91/faithful-peek-lite.js'),visual91=read('src/v91/peek-visual-sync.js'),legacyPeek=read('peek.js');
const checks=[
[index.includes("const BUILD='91'"),'index BUILD must be 91'],
[index.includes('src/v91/peek-visual-sync.js'),'v91 visual sync loader missing'],
[index.includes('src/v91/faithful-peek-lite.js'),'v91 faithful peek loader missing'],
[!index.includes('<script defer src="./src/v90/faithful-peek-lite.js'),'v90 runtime must not load'],
[!index.includes('<script defer src="./src/v89/faithful-peek.js'),'v89 runtime must not load'],
[menu.includes("mode:'v50-native-fab'"),'v50 FAB mode missing'],
[!index.includes('<script defer src="./src/v70/auto-planner.js'),'auto planner must stay removed'],
[peek91.includes("mode:'single-listener-visual-fidelity'"),'v91 viewer mode missing'],
[peek91.includes('visualDays'),'visual metadata merge missing'],
[peek91.includes('markKind'),'manual mark fidelity missing'],
[peek91.includes('dayColor'),'multi-source day color resolver missing'],
[peek91.includes('text-align:center'),'date centering missing'],
[peek91.includes('stopImmediatePropagation'),'legacy calendar listener suppression missing'],
[peek91.includes('lastSig'),'duplicate render suppression missing'],
[peek91.includes('contain:layout paint style'),'render containment missing'],
[visual91.includes('visualKeys'),'visual metadata publisher missing'],
[visual91.includes('fc_peek_visual_sync_'),'visual sync hash cache missing'],
[visual91.includes('{merge:true}'),'visual sync must merge safely'],
[legacyPeek.includes('{merge:true}'),'base peek sync must merge safely'],
[sw.includes('focuscal-v91-faithful-colors-centered-dates'),'v91 service-worker cache missing'],
[rules.includes('match /events/{eventId}'),'Firestore events rule missing'],
[!rules.includes('allow read, write: if true'),'Unsafe Firestore allow-all rule detected'],
[feedback.includes("collection(db,'feedback')"),'Feedback must write to Firestore'],
[adminJs.includes('clusterStats'),'Feedback clustering missing'],
[read('src/v70/account.js').includes('linkWithPopup'),'Account linking missing'],
[read('src/v70/collaboration.js').includes("collection(db,'spaces')"),'Shared spaces missing']
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg)}
console.log(`FocusCal v91 integrity OK: ${mustExist.length} required files, visual fidelity + centered dates preserved.`);