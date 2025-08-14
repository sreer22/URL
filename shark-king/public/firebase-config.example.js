// Copy this file to firebase-config.js and fill in your values.
// Firebase Console -> Project Settings -> General -> SDK setup and configuration (Web)
// Enable Firebase Authentication providers (Email/Password, Phone, Google, GitHub, Microsoft)
// Add your hosting domain to Authentication -> Settings -> Authorized domains

window.firebaseConfig = {
	apiKey: "",
	authDomain: "",
	projectId: "",
	storageBucket: "",
	messagingSenderId: "",
	appId: ""
};

// Optional: EmailJS for contact form email delivery
// Create at https://www.emailjs.com/ (free tier)
// serviceId: e.g., 'service_xxx', templateId: e.g., 'template_xxx', publicKey: e.g., 'xxxx'
window.SHARK_EMAILJS = {
	serviceId: "",
	templateId: "",
	publicKey: ""
};