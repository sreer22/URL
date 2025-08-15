import type { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import { OfflineBadge } from "@/components/OfflineBadge";

export default function SiteLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
			<link rel="manifest" href="/manifest.json" />
			<link rel="icon" href="/favicon.ico" />
			<meta name="theme-color" content="#00FFFF" />
			<NavBar />
			<main>{children}</main>
			<Footer />
			<AIChatbot />
			<OfflineBadge />
		</div>
	);
}