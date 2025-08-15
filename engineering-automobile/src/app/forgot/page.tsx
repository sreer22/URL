"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [step, setStep] = useState<"identify" | "verify" | "reset">("identify");
	const [identifier, setIdentifier] = useState("");
	const [delivery, setDelivery] = useState<"email" | "sms">("email");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");

	const next = async () => {
		const res = await fetch("/api/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, delivery }) });
		if (res.ok) setStep("verify"); else setMessage("User not found or error");
	};
	const verify = async () => {
		const res = await fetch("/api/otp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: identifier, purpose: "forgot", code: otp }) });
		if (res.ok) setStep("reset"); else setMessage("Invalid OTP");
	};
	const reset = async () => {
		const res = await fetch("/api/password/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, code: otp, newPassword }) });
		if (res.ok) { window.location.href = "/login?reset=success"; } else setMessage("Failed to reset password");
	};

	return (
		<div className="mx-auto max-w-2xl px-4 md:px-6 py-10">
			<h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
			{step === "identify" && (
				<div className="space-y-3 border border-white/10 rounded-xl p-6">
					<input placeholder="Email, Username, or Phone" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
					<div className="flex gap-3 text-sm">
						<label className="flex items-center gap-2"><input type="radio" checked={delivery === 'email'} onChange={() => setDelivery('email')} /> Email</label>
						<label className="flex items-center gap-2"><input type="radio" checked={delivery === 'sms'} onChange={() => setDelivery('sms')} /> Phone</label>
					</div>
					<button onClick={next} className="px-4 py-2 rounded bg-white/10">Next</button>
				</div>
			)}
			{step === "verify" && (
				<div className="space-y-3 border border-white/10 rounded-xl p-6">
					<input placeholder="Enter OTP" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={otp} onChange={(e) => setOtp(e.target.value)} />
					<button onClick={verify} className="px-4 py-2 rounded bg-white/10">Verify</button>
				</div>
			)}
			{step === "reset" && (
				<div className="space-y-3 border border-white/10 rounded-xl p-6">
					<input placeholder="Create New Password" type="password" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
					<button onClick={reset} className="px-4 py-2 rounded bg-white/10">Set Password</button>
				</div>
			)}
			{message && <div className="text-sm text-zinc-400 mt-3">{message}</div>}
		</div>
	);
}