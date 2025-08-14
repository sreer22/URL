# Shark King — Cybersecurity Portfolio

Modern neon-dark portfolio with smooth RGB background, SPA navigation, resume PDF, interactive projects, contact form (email + Firestore), and secure login (email/password, phone OTP, Google, GitHub, Microsoft) using Firebase.

## Quick Start

1) Edit `public/firebase-config.js` with your Firebase Web config
- Firebase Console → Project settings → General → Your apps (Web)
- Enable providers in Authentication → Sign-in method: Email/Password, Phone, Google, GitHub, Microsoft
- Add authorized domains (Authentication → Settings):
  - `localhost`
  - `<PROJECT_ID>.web.app`
  - `<PROJECT_ID>.firebaseapp.com`
  - Your custom domain or Netlify/Vercel domain if used

2) Optional email delivery via EmailJS for contact form
- Create a free account at emailjs.com
- Create a service + template and get a public key
- Replace `window.SHARK_EMAILJS = null;` in `public/firebase-config.js` with your object:
```js
window.SHARK_EMAILJS = { serviceId: 'service_xxx', templateId: 'template_xxx', publicKey: 'xxxx' };
```

3) Local preview
```bash
npm run serve
# then open http://localhost:4173
```

## Deploy to Firebase Hosting (recommended)

Requirements: Firebase CLI and an access token.

```bash
curl -sL https://firebase.tools | bash -s -- --install-only
# set environment vars BEFORE deploying
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_TOKEN="<paste token from: firebase login:ci>"

# deploy hosting + rules
firebase deploy --only hosting,firestore:rules --project "$FIREBASE_PROJECT_ID" --token "$FIREBASE_TOKEN"
```

## Deploy to Netlify (alternative)

- Create a site in Netlify and note the `SITE_ID`
- Set a `NETLIFY_AUTH_TOKEN` from your Netlify user settings
```bash
npx netlify-cli deploy --dir=public --prod --site $SITE_ID --auth $NETLIFY_AUTH_TOKEN
```
Add the final domain to Firebase Auth authorized domains.

## Deploy to Vercel (alternative)

- Create a Vercel token and project
```bash
npx vercel deploy --prebuilt --yes --token $VERCEL_TOKEN --prod
```
Add the final Vercel domain to Firebase Auth authorized domains.

## Firestore security

See `firestore.rules`. Visitors can create `contactMessages` (write-only). Signed-in users can update their own profile in `users`. `projects` are publicly readable.

## Phone OTP notes

- Uses invisible reCAPTCHA; ensure your domain is on the Firebase Auth authorized domains list.

## Brand

- Site name: Shark King
- Theme: neon cyber-security, dark mode, responsive