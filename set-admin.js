// Run from the project root after `npm install firebase-admin`.
// Usage: GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.js user@example.com
const admin = require('firebase-admin');
const email = process.argv[2];
if (!email) throw new Error('Usage: node scripts/set-admin.js user@hbplusfit.com');
if (!email.toLowerCase().endsWith('@hbplusfit.com')) throw new Error('Admin email must use @hbplusfit.com');
admin.initializeApp({ credential: admin.credential.applicationDefault() });
(async () => {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin role assigned to ${email}. Ask the user to sign out and sign in again.`);
  process.exit(0);
})().catch((err) => { console.error(err); process.exit(1); });