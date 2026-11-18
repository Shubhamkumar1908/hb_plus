# HBPlus Secure Portal

A cross-platform Google sign-in application built with **React Native, Expo, React Native Web and Firebase**. The same codebase runs in a browser and on Android/iOS.

## Features

- Google OAuth sign-in
- Email-domain allowlist (`@hbplusfit.com` by default)
- Verified-email requirement
- Protected dashboard and logout
- Firebase Auth session persistence (AsyncStorage on native)
- Firestore user profiles and Admin/User role display
- Firestore rules that deny access to unauthorized identities
- Firebase Authentication blocking function for server-side signup rejection
- Responsive login and dashboard layouts

## 1. Requirements

- Node.js 20 or newer
- npm
- A Firebase project
- A Google Cloud OAuth client configuration
- Expo Go for quick native testing, or Android Studio/Xcode for emulators

## 2. Install

```bash
npm install
```

On Windows PowerShell, create the environment file with `Copy-Item .env.example .env` (on macOS/Linux, use `cp .env.example .env`). Replace the example values with your Firebase project settings and Google OAuth client IDs. Restart Expo after changing environment variables.

## 3. Firebase setup

1. Create a project at https://console.firebase.google.com/.
2. Add a Web app and copy its Firebase config into `.env`.
3. In **Authentication → Sign-in method**, enable Google.
4. In **Authentication → Settings → Authorized domains**, add your deployed Netlify domain and local development domain if required.
5. Create a Firestore database.
6. Publish `firestore.rules` from the Firebase console or deploy with Firebase CLI.
7. In Google Cloud Console, configure OAuth consent screen and create Web, Android and iOS OAuth client IDs. Add the appropriate origins, redirect URIs, package name and signing certificate fingerprints. Put client IDs in `.env`.

Firebase web configuration values and OAuth client IDs are public app configuration, not server secrets. Never put service-account keys in the app or commit them.

## 4. Run

```bash
# Web
npm run web

# Expo development server (choose Android/iOS from the terminal)
npm start
```

For a native development build, configure the Android package / iOS bundle identifier and OAuth client IDs to match `app.json`. The custom URL scheme is `hbplusauth`.

## 5. Authentication flow

1. The user selects **Continue with Google**.
2. Web uses Firebase's Google popup provider. Native obtains a Google ID token with Expo AuthSession and exchanges it for a Firebase credential.
3. The app checks that the Firebase identity has a verified email and that the domain is exactly `hbplusfit.com`.
4. If the check fails, Firebase signs the user out and the login page shows: **Access restricted. Please login using your official domain email.**
5. Only an authorized Firebase user can render `/dashboard`. Direct navigation to the dashboard redirects to login when no authorized session exists.
6. Logout calls Firebase `signOut`.

The domain check compares the complete domain after `@`, so `person@hbplusfit.com` passes while `person@gmail.com` and `person@sub.hbplusfit.com` do not.

## 6. Server-side enforcement (important)

A browser-side check is not a security boundary by itself. This repository includes `functions/index.js`, a Firebase Authentication `beforeUserCreated` blocking function. Deploy it on a Firebase project upgraded to **Firebase Authentication with Identity Platform**:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions:restrictSignupDomain
```

Set the function environment variable `ALLOWED_EMAIL_DOMAIN=hbplusfit.com` if you need to override the default. Configure the blocking function in Firebase Authentication / Identity Platform as required by your project. The function rejects unverified email addresses and all other domains before account creation.

The Firestore rules independently require a verified `@hbplusfit.com` identity for user profile reads and writes. Apply the rules before storing private data. Do not rely on hiding UI elements as authorization.

## 7. Roles

New user profiles default to `user`. Admin status is read from the Firebase custom claim `admin`; clients cannot set this claim or promote themselves. To promote an account, use a trusted environment with Firebase Admin SDK credentials:

```bash
npm install firebase-admin
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/set-admin.js admin@hbplusfit.com
```

Never commit the service-account JSON. The user must sign out and back in to refresh the custom claim. Extend Firestore rules for specific admin-only collections/actions as needed.

## 8. Netlify deployment

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and select the repository.
3. Set build command to `npm run export:web` and publish directory to `dist` (already in `netlify.toml`).
4. Add all `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_GOOGLE_*` variables in Netlify site environment settings. Add `EXPO_PUBLIC_ALLOWED_EMAIL_DOMAIN=hbplusfit.com`.
5. Deploy, then add the Netlify hostname to Firebase Authentication's authorized domains and configure it in the Google OAuth client settings.

## Project structure

```text
app/
  _layout.tsx
  index.tsx
  dashboard.tsx
src/
  auth/AuthProvider.tsx
  screens/LoginScreen.tsx
  screens/DashboardScreen.tsx
  config.ts
  firebase.ts
functions/
  index.js
firestore.rules
scripts/set-admin.js
```

## Notes

- This is a starter implementation. Before production use, test OAuth redirect configuration on the exact Android/iOS package IDs, signing certificates and deployed web hostname.
- Keep all private application data behind Firestore/Storage rules or a trusted backend. A protected React route is a user-experience feature, not a replacement for backend authorization.
