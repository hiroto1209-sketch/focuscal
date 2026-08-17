import fs from 'node:fs';
const mustExist=[
  'index.html','app.html','firebase-config.js','push-config.js','peek.js','enhancements.js','ui-polish-v57.js',
  'peek-calendar-v58.js','peek-appearance-live-v58.js','peek-cell-style-v59.js','feedback-v60.js',
  'admin.html','admin-dashboard.js','ops.html','src/v70/ops-dashboard.js',
  'src/v70/auto-planner.js','src/v70/account.js','src/v70/collaboration.js','src/v70/notifications.js','src/v70/observability.js',
  'src/v71/action-menu.js','src/v72/header-cleanup.js','functions/package.json','functions/index.js','firestore.rules','sw.js',
  '.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/ui_feedback.yml','.github/ISSUE_TEMPLATE/performance_feedback.yml'
];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}
const read=f=>fs.readFileSync(f,'utf8');
const index=read('index.html'),admin=read('admin.html'),adminJs=read('admin-dashboard.js'),sw=read('sw.js'),rules=read('firestore.rules'),feedback=read('feedback-v60.js'),menu=read('src/v72/header-cleanup.js'),planner=read('src/v70/auto-planner.js');
const checks=[
  [index.includes("const BUILD='74'"),'index BUILD must be 74'],
  [index.includes('src/v72/header-cleanup.js?v='),'header cleanup must be boot-wired'],
  [menu.includes("const BUILD='74'"),'header cleanup BUILD must be 74'],
  [menu.includes('fc-secondary-pending'),'pending secondary controls must be hidden until relocated'],
  [menu.includes("querySelectorAll('button,[role=\"button\"],a.nav-btn,.nav-btn')"),'header cleanup must scan all interactive control types'],
  [menu.includes('restoreSettings'),'settings restoration missing'],
  [planner.includes("const BUILD='73'"),'auto planner mobile repair build missing'],
  [planner.includes('@media(max-width:430px)'),'auto planner mobile breakpoint missing'],
  [planner.includes('grid-template-columns:1fr'),'auto planner must collapse to one column on iPhone'],
  [index.includes('src/v70/auto-planner.js?v='),'auto planner must be boot-wired'],
  [index.includes('src/v70/account.js?v='),'account must be boot-wired'],
  [index.includes('src/v70/collaboration.js?v='),'collaboration must be boot-wired'],
  [index.includes('src/v70/notifications.js?v='),'notifications must be boot-wired'],
  [index.includes('src/v70/observability.js?v='),'observability must be boot-wired'],
  [index.includes('push-config.js?v='),'push config must be boot-wired'],
  [sw.includes('focuscal-v74-structural-header-repair'),'v74 service-worker cache missing'],
  [sw.includes('src/v72/header-cleanup.js'),'header cleanup missing from service-worker core'],
  [sw.includes('firebase.messaging().onBackgroundMessage'),'FCM background handler missing'],
  [rules.includes('match /feedback/{feedbackId}'),'Firestore feedback rule missing'],
  [rules.includes('match /admins/{uid}'),'Firestore admin rule missing'],
  [rules.includes('match /spaces/{spaceId}'),'shared spaces rule missing'],
  [rules.includes('match /spaceEvents/{eventId}'),'shared events rule missing'],
  [rules.includes('match /clientErrors/{id}'),'error telemetry rule missing'],
  [rules.includes('match /productEvents/{id}'),'product analytics rule missing'],
  [rules.includes('match /pushTokens/{uid}'),'push token rule missing'],
  [!rules.includes('allow read, write: if true'),'Unsafe Firestore allow-all rule detected'],
  [feedback.includes("collection(db,'feedback')"),'Feedback must write to Firestore collection'],
  [admin.includes('admin-dashboard.js?v=61'),'Admin dashboard script missing'],
  [adminJs.includes('clusterStats'),'Feedback clustering missing'],
  [planner.includes('findSlot'),'Automatic scheduler missing'],
  [read('src/v70/account.js').includes('linkWithPopup'),'Account linking missing'],
  [read('src/v70/collaboration.js').includes("collection(db,'spaces')"),'Shared spaces implementation missing'],
  [read('src/v70/notifications.js').includes('getToken'),'FCM token registration missing'],
  [read('src/v70/observability.js').includes("write('clientErrors'"),'Error monitoring missing'],
  [read('src/v70/observability.js').includes("write('productEvents'"),'Product analytics missing'],
  [read('functions/index.js').includes('onPeekRequestCreated'),'Push function for peek request missing']
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg)}
const scriptRefs=[...index.matchAll(/src=\\?['\"]\.\/(.+?)\?v=/g)].map(m=>m[1]);
for(const ref of scriptRefs){if(!fs.existsSync(ref))throw new Error(`Boot references missing asset: ${ref}`)}
console.log(`FocusCal v74 integrity OK: ${mustExist.length} required files, ${scriptRefs.length} boot scripts, structural header + mobile planner verified.`);
