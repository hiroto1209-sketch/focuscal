# FocusCal v70 Core Upgrade

## What is implemented

### 1. Intelligent scheduling
`src/v70/auto-planner.js` reads the existing `fc_<year>_<month>` local calendar model, finds a conflict-free continuous slot before a deadline, and writes a normal FocusCal event back into the same model. This avoids a second calendar database.

### 2. Persistent accounts
`src/v70/account.js` upgrades the current anonymous Firebase user by linking Google or Apple with `linkWithPopup`. Because linking preserves the Firebase UID, existing FocusCal sharing relationships can remain attached to the same identity. It also provides cloud settings backup/restore under `users/{uid}`.

### 3. Shared spaces
`src/v70/collaboration.js` adds `spaces`, `spaceCodes`, and `spaceEvents` for couples, families, and teams. Members can create shared events in real time.

### 4. Notifications
`src/v70/notifications.js` provides local 10-minute reminders and FCM token registration. `sw.js` contains the background FCM handler. `functions/index.js` contains backend triggers for peek requests and shared-event notifications.

### 5. Error monitoring and analytics
`src/v70/observability.js` records bounded client errors in `clientErrors` and product actions in `productEvents`. It intentionally does not copy calendar event text or memo bodies into telemetry.

`ops.html` is the admin-only Product Health view for usage and error trends.

### 6. Feedback intelligence
`admin-dashboard.js` now boosts priority when the same category/title pattern is reported repeatedly, by multiple users, or across multiple builds.

### 7. Architecture
New systems live in `src/v70/` instead of growing the existing `app.html` monolith. New product domains should follow this modular pattern.

## Firebase activation checklist

After merge, the browser code is present but these external Firebase switches must be enabled:

1. **Publish the new Firestore Rules**
   - Firebase Console → Firestore Database → Rules
   - Replace with repository `firestore.rules`
   - Publish

2. **Account providers**
   - Firebase Console → Authentication → Sign-in method
   - Enable Google to activate Google account linking.
   - Apple additionally requires Apple Developer OAuth configuration before enabling Apple in Firebase.

3. **Web Push / FCM**
   - Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
   - Generate/copy the public VAPID key.
   - Put the public key into `push-config.js` as `window.FOCUSCAL_FCM_VAPID_KEY`.
   - This is a public browser key, not a server secret.

4. **Background push Cloud Functions**
   - Project files are already configured with `.firebaserc`, `firebase.json`, and `functions/`.
   - Deploy with Firebase CLI: `firebase deploy --only functions,firestore:rules`
   - Cloud Functions may require the Firebase project to use a billing plan supported by the selected Functions generation/region.

## Safety rules

- Never use `allow read, write: if true`.
- Feedback, telemetry and product events are readable only by a provisioned admin.
- A user can manage only their own `pushTokens/{uid}` document.
- Existing `peekVisibility == private` event protection remains untouched.
- Analytics must not collect event titles, calendar memo bodies, or private shared-calendar payloads.
