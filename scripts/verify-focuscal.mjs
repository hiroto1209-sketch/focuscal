import fs from 'node:fs';

const mustExist=[
  'index.html','app.html','firebase-config.js','peek.js','enhancements.js','ui-polish-v57.js',
  'peek-calendar-v58.js','peek-appearance-live-v58.js','peek-cell-style-v59.js','feedback-v60.js',
  'firestore.rules','sw.js',
  '.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml',
  '.github/ISSUE_TEMPLATE/ui_feedback.yml','.github/ISSUE_TEMPLATE/performance_feedback.yml'
];
for(const file of mustExist){if(!fs.existsSync(file))throw new Error(`Missing required file: ${file}`)}

const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');
const feedback=fs.readFileSync('feedback-v60.js','utf8');

const checks=[
  [index.includes("const BUILD='60'"),'index BUILD must be 60'],
  [index.includes('feedback-v60.js?v='),'feedback-v60.js must be boot-wired'],
  [sw.includes('feedback-v60.js'),'feedback-v60.js must be service-worker managed'],
  [rules.includes('match /feedback/{feedbackId}'),'Firestore feedback rule missing'],
  [rules.includes('allow create: if signedIn()'),'Feedback must require auth'],
  [!rules.includes('allow read, write: if true'),'Unsafe Firestore allow-all rule detected'],
  [feedback.includes("collection(db,'feedback')"),'Feedback must write to Firestore collection'],
  [feedback.includes('issues/new?'),'GitHub fallback missing'],
  [feedback.includes('userAgent'),'Environment metadata missing']
];
for(const [ok,msg] of checks){if(!ok)throw new Error(msg)}

const scriptRefs=[...index.matchAll(/src=\\?['\"]\.\/(.+?)\?v=/g)].map(m=>m[1]);
for(const ref of scriptRefs){if(!fs.existsSync(ref))throw new Error(`Boot references missing asset: ${ref}`)}
console.log(`FocusCal integrity OK: ${mustExist.length} required files, ${scriptRefs.length} boot scripts checked.`);
