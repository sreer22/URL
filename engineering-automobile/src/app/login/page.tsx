"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [otpTarget, setOtpTarget] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [message, setMessage] = useState("");

	const loginCredentials = async () => {
		await signIn("credentials", { identifier, password, callbackUrl: "/" });
	};

	const sendOtp = async (channel: "email" | "sms") => {
		const res = await fetch("/api/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: otpTarget, channel, purpose: "login" }) });
		if (res.ok) { setOtpSent(true); setMessage("OTP sent"); } else { setMessage("Failed to send OTP"); }
	};

	const verifyOtp = async () => {
		const res = await fetch("/api/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: otpTarget, purpose: "login", code: otpCode }) });
		if (res.ok) { setMessage("OTP verified. Please continue with OAuth or credentials to create a session."); } else { setMessage("Invalid OTP"); }
	};

	return (
		<div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
			<h1 className="text-2xl font-bold mb-6">Login / Sign Up</h1>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="border border-white/10 rounded-xl p-6 space-y-3">
					<h2 className="font-semibold">Email / Password</h2>
					<input placeholder="Email / Username / Phone" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
					<input placeholder="Password" type="password" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
					<button onClick={loginCredentials} className="w-full px-3 py-2 rounded bg-white/10">Login</button>
					<a href="/forgot" className="text-sm text-zinc-400">Forgot Password?</a>
				</div>
				<div className="border border-white/10 rounded-xl p-6 space-y-3">
					<h2 className="font-semibold">One-Time Password (OTP)</h2>
					<input placeholder="Email or Mobile" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={otpTarget} onChange={(e) => setOtpTarget(e.target.value)} />
					<div className="flex gap-2">
						<button onClick={() => sendOtp("email")} className="px-3 py-2 rounded bg-white/10">Send Email OTP</button>
						<button onClick={() => sendOtp("sms")} className="px-3 py-2 rounded bg-white/10">Send SMS OTP</button>
					</div>
					{otpSent && (
						<div className="space-y-2">
							<input placeholder="Enter OTP" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
							<button onClick={verifyOtp} className="w-full px-3 py-2 rounded bg-white/10">Verify OTP</button>
						</div>
					)}
					{message && <div className="text-sm text-zinc-400">{message}</div>}
				</div>
			</div>
			<div className="mt-6 grid md:grid-cols-3 gap-3">
				<button className="px-4 py-2 rounded bg-white/10" onClick={() => signIn("google", { callbackUrl: "/" })}>Continue with Google</button>
				<button className="px-4 py-2 rounded bg-white/10" onClick={() => signIn("github", { callbackUrl: "/" })}>Continue with GitHub</button>
				<button className="px-4 py-2 rounded bg-white/10" onClick={() => signIn("azure-ad", { callbackUrl: "/" })}>Continue with Microsoft</button>
			</div>
		</div>
	);
}