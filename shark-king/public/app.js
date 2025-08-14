/* App entry: Shark King Portfolio */

// Utilities
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const toast = (msg, timeout = 3000) => {
	const t = $('#toast');
	if (!t) return;
	t.textContent = msg;
	t.classList.add('show');
	setTimeout(() => t.classList.remove('show'), timeout);
};

// Nav handling
const sections = $$('.section');
const navLinks = $$('.nav-link');

function showSection(id) {
	sections.forEach(s => {
		if (s.id === id) {
			s.classList.add('visible');
		} else {
			s.classList.remove('visible');
		}
	});
	navLinks.forEach(a => {
		if (a.dataset.section === id) a.classList.add('active'); else a.classList.remove('active');
	});
	// Blink animation on click
	const link = navLinks.find(a => a.dataset.section === id);
	if (link) {
		link.classList.remove('clicked');
		requestAnimationFrame(() => link.classList.add('clicked'));
	}
}

function handleHash() {
	const target = location.hash.replace('#', '') || 'home';
	showSection(target);
}

window.addEventListener('hashchange', handleHash);
window.addEventListener('DOMContentLoaded', () => {
	$('#year').textContent = new Date().getFullYear();
	handleHash();
	initTyped();
	initTabs();
	initResumeDownload();
	initProjects();
	initContactForm();
	initAuth();
	attachNavClicks();
});

function attachNavClicks() {
	$$('[data-section]').forEach(el => {
		el.addEventListener('click', e => {
			const target = el.getAttribute('data-section');
			if (target) {
				// Allow normal anchor to change hash, but ensure blink now
				el.classList.add('clicked');
			}
		});
	});
}

// Typed intro
function initTyped() {
	const el = $('#intro-typed');
	if (!el) return;
	const lines = [
		"Cybersecurity portfolio of Shark King.",
		"Red teaming. Blue teaming. Purple excellence.",
		"I break things to make them stronger.",
		"Welcome — stay sharp, stay secure."
	];
	let idx = 0, ch = 0, deleting = false;
	function step() {
		const current = lines[idx];
		if (!deleting) {
			ch++;
			el.textContent = current.slice(0, ch);
			if (ch === current.length) {
				deleting = true;
				setTimeout(step, 1200);
				return;
			}
			setTimeout(step, 36 + Math.random()*40);
		} else {
			ch--;
			el.textContent = current.slice(0, ch);
			if (ch === 0) {
				deleting = false;
				idx = (idx + 1) % lines.length;
			}
			setTimeout(step, 22 + Math.random()*28);
		}
	}
	step();
}

// Tabs in login box
function initTabs() {
	const tabs = $$('.tab-btn');
	tabs.forEach(btn => {
		btn.addEventListener('click', () => {
			tabs.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			$$('.tab-content').forEach(c => c.classList.remove('active'));
			$(`#tab-${btn.dataset.tab}`).classList.add('active');
		});
	});
}

// Resume download using html2pdf
function initResumeDownload() {
	const btn = $('#download-resume');
	if (!btn) return;
	btn.addEventListener('click', () => {
		const el = $('#resume-card');
		html2pdf().from(el).set({
			margin: 0.5,
			filename: 'Shark-King-Resume.pdf',
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { scale: 2, useCORS: true },
			jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
		}).save();
	});
}

// Projects rendering (optional Firestore-driven, fallback to static)
async function initProjects() {
	const grid = $('#projects-grid');
	if (!grid) return;
	const fallback = [
		{ title: 'PhishNet: Detection Playbooks', desc: 'End-to-end phishing defense automation with SOAR and YARA-L.', href: '#', icon: '🪝' },
		{ title: 'Cloud Guardrails', desc: 'Terraform + OPA policies to prevent cloud misconfigurations.', href: '#', icon: '☁️' },
		{ title: 'BreachLab', desc: 'Adversary emulation lab with Atomic Red Team and Caldera.', href: '#', icon: '🧪' },
		{ title: 'Malware Zoo', desc: 'Static and dynamic analysis pipelines in a sandboxed lab.', href: '#', icon: '🐾' },
		{ title: 'Threat Graph', desc: 'Knowledge graph of TTPs, detections, and mitigations.', href: '#', icon: '🕸️' },
		{ title: 'Packet Shark', desc: 'High-speed packet capture and anomaly detection toolkit.', href: '#', icon: '🦈' }
	];
	try {
		const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
		const db = maybeDb();
		if (db) {
			const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
			const snap = await getDocs(q);
			if (!snap.empty) {
				const items = [];
				snap.forEach(doc => items.push(doc.data()));
				renderCards(grid, items);
				return;
			}
		}
	} catch (e) {
		// no-op fallback
	}
	renderCards(grid, fallback);
}

function renderCards(grid, items) {
	grid.innerHTML = '';
	items.forEach(item => {
		const card = document.createElement('div');
		card.className = 'card';
		card.innerHTML = `
			<div class="media">${item.icon || '🔒'}</div>
			<div class="body">
				<h3>${escapeHtml(item.title || 'Project')}</h3>
				<p>${escapeHtml(item.desc || '')}</p>
				<div class="actions">
					<a class="btn btn-ghost" href="${item.href || '#'}" target="_blank" rel="noopener">View</a>
				</div>
			</div>
		`;
		grid.appendChild(card);
	});
}

function escapeHtml(str) {
	return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
}

// Contact form integrates Firestore + EmailJS (optional)
function initContactForm() {
	const form = $('#contact-form');
	if (!form) return;
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const name = $('#cf-name').value.trim();
		const email = $('#cf-email').value.trim();
		const message = $('#cf-message').value.trim();
		const status = $('#contact-status');
		status.textContent = 'Sending...';
		try {
			const db = maybeDb();
			if (db) {
				const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
				await addDoc(collection(db, 'contactMessages'), { name, email, message, createdAt: serverTimestamp() });
			}
			await maybeSendEmail({ name, email, message });
			status.textContent = 'Message sent!';
			toast('Thanks! Your message has been sent.');
			form.reset();
		} catch (err) {
			console.error(err);
			status.textContent = 'Failed to send. Please try again later.';
			toast('Could not send message. Check connection or configuration.');
		}
	});
}

async function maybeSendEmail(payload) {
	try {
		if (window.EmailJS && window.SHARK_EMAILJS) {
			window.EmailJS.init(window.SHARK_EMAILJS.publicKey);
			await window.EmailJS.send(window.SHARK_EMAILJS.serviceId, window.SHARK_EMAILJS.templateId, payload);
			return true;
		}
	} catch (e) {
		console.warn('EmailJS send failed', e);
	}
	return false;
}

// Firebase setup and Authentication flows
let appInstance = null;
let auth = null;
let dbInstance = null;

function maybeDb() { return dbInstance; }

async function initAuth() {
	const year = new Date().getFullYear();
	try {
		const config = resolveFirebaseConfig();
		const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js');
		appInstance = initializeApp(config);
		const { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
		auth = getAuth(appInstance);
		await setPersistence(auth, browserLocalPersistence);
		const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
		dbInstance = getFirestore(appInstance);

		onAuthStateChanged(auth, user => {
			if (user) {
				toast(`Welcome back, ${user.displayName || user.email || 'Shark'}!`);
				// Store/update user profile
				upsertUserProfile(user).catch(console.warn);
			} else {
				// signed out
			}
		});

		wireAuthUI();
		setupPhoneRecaptcha();
	} catch (err) {
		console.warn('Firebase not initialized. Provide config in firebase-config.js', err);
	}
}

function resolveFirebaseConfig() {
	if (window.firebaseConfig && window.firebaseConfig.apiKey) return window.firebaseConfig;
	// Placeholder that will throw on use
	return {
		apiKey: 'YOUR_API_KEY',
		authDomain: 'YOUR_DOMAIN.firebaseapp.com',
		projectId: 'YOUR_PROJECT_ID',
		storageBucket: 'YOUR_BUCKET.appspot.com',
		messagingSenderId: 'YOUR_SENDER_ID',
		appId: 'YOUR_APP_ID'
	};
}

async function upsertUserProfile(user) {
	if (!dbInstance || !user) return;
	const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js');
	const ref = doc(dbInstance, 'users', user.uid);
	await setDoc(ref, {
		uid: user.uid,
		email: user.email || null,
		displayName: user.displayName || null,
		phoneNumber: user.phoneNumber || null,
		photoURL: user.photoURL || null,
		providerIds: (user.providerData || []).map(p => p.providerId),
		updatedAt: serverTimestamp()
	}, { merge: true });
}

function wireAuthUI() {
	const emailEl = $('#login-email');
	const passEl = $('#login-password');
	const btnLogin = $('#btn-login');
	const btnSignup = $('#btn-signup');
	const forgot = $('#forgot-password');
	const loginBox = $('#login-box');
	const status = $('#auth-status');

	if (btnLogin) btnLogin.addEventListener('click', async () => {
		status.textContent = 'Signing in...';
		try {
			const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
			status.textContent = 'Signed in';
			toast('Signed in successfully');
		} catch (e) {
			status.textContent = e.code === 'auth/wrong-password' ? 'Wrong password' : (e.message || 'Failed to sign in');
			loginBox.classList.remove('shake');
			void loginBox.offsetWidth; // reflow
			loginBox.classList.add('shake');
		}
	});

	if (btnSignup) btnSignup.addEventListener('click', async () => {
		status.textContent = 'Creating account...';
		try {
			const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await createUserWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
			status.textContent = 'Account created';
			toast('Account created. You are signed in.');
		} catch (e) {
			status.textContent = e.message || 'Failed to sign up';
		}
	});

	if (forgot) forgot.addEventListener('click', async (e) => {
		e.preventDefault();
		const email = emailEl.value.trim();
		if (!email) { toast('Enter your email first'); return; }
		try {
			const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await sendPasswordResetEmail(auth, email);
			toast('Reset link sent. Check your email.');
		} catch (e) {
			toast(e.message || 'Could not send reset email');
		}
	});

	const googleBtn = $('#login-google');
	const githubBtn = $('#login-github');
	const msBtn = $('#login-microsoft');
	const socialStatus = $('#social-status');

	if (googleBtn) googleBtn.addEventListener('click', async () => {
		socialStatus.textContent = 'Opening Google...';
		try {
			const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await signInWithPopup(auth, new GoogleAuthProvider());
			socialStatus.textContent = 'Signed in';
			toast('Signed in with Google');
		} catch (e) { socialStatus.textContent = parseAuthError(e); }
	});
	if (githubBtn) githubBtn.addEventListener('click', async () => {
		socialStatus.textContent = 'Opening GitHub...';
		try {
			const { GithubAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await signInWithPopup(auth, new GithubAuthProvider());
			socialStatus.textContent = 'Signed in';
			toast('Signed in with GitHub');
		} catch (e) { socialStatus.textContent = parseAuthError(e); }
	});
	if (msBtn) msBtn.addEventListener('click', async () => {
		socialStatus.textContent = 'Opening Microsoft...';
		try {
			const { OAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			await signInWithPopup(auth, new OAuthProvider('microsoft.com'));
			socialStatus.textContent = 'Signed in';
			toast('Signed in with Microsoft');
		} catch (e) { socialStatus.textContent = parseAuthError(e); }
	});

	// Phone OTP
	const sendOtpBtn = $('#send-otp');
	const verifyOtpBtn = $('#verify-otp');
	const phoneStatus = $('#phone-status');

	if (sendOtpBtn) sendOtpBtn.addEventListener('click', async () => {
		phoneStatus.textContent = 'Sending OTP...';
		try {
			const { signInWithPhoneNumber } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
			const phone = $('#phone-number').value.trim();
			if (!phone) { phoneStatus.textContent = 'Enter phone number'; return; }
			window.confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
			phoneStatus.textContent = 'OTP sent';
			toast('OTP sent to your phone');
		} catch (e) { phoneStatus.textContent = parseAuthError(e); }
	});
	if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', async () => {
		phoneStatus.textContent = 'Verifying...';
		try {
			const code = $('#otp-code').value.trim();
			if (!code) { phoneStatus.textContent = 'Enter OTP'; return; }
			await window.confirmationResult.confirm(code);
			phoneStatus.textContent = 'Signed in';
			toast('Phone verified. Signed in.');
		} catch (e) { phoneStatus.textContent = parseAuthError(e); }
	});
}

async function setupPhoneRecaptcha() {
	try {
		const { RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js');
		window.recaptchaVerifier = new RecaptchaVerifier($('#recaptcha-container'), {
			size: 'invisible'
		}, auth);
	} catch (e) { /* ignore */ }
}

function parseAuthError(e) {
	if (!e || !e.code) return e?.message || 'Authentication failed';
	return e.code.replace('auth/', '').replace(/-/g, ' ');
}