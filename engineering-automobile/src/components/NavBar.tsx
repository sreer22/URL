"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/bikes", label: "Bikes" },
	{ href: "/cars", label: "Cars" },
	{ href: "/about", label: "About Us" },
];

export function NavBar() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	return (
		<header className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
			<div className="mx-auto max-w-7xl px-4 md:px-6">
				<div className="flex h-16 items-center justify-between">
					<Link href="/" className="text-lg font-extrabold bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88] bg-clip-text text-transparent">
						Engineering Automobile
					</Link>
					<nav className="hidden md:flex gap-6 text-sm">
						{navItems.map((item) => (
							<Link key={item.href} href={item.href} className={`hover:text-white transition ${(pathname === item.href) ? "text-white" : "text-zinc-300"}`}>
								{item.label}
							</Link>
						))}
						<Link href="/login" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white">Login / Sign Up</Link>
					</nav>
					<button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white">☰</button>
				</div>
			</div>
			{open && (
				<div className="md:hidden border-t border-white/10">
					<div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3">
						{navItems.map((item) => (
							<Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-zinc-200">
								{item.label}
							</Link>
						))}
						<Link href="/login" onClick={() => setOpen(false)} className="px-4 py-2 rounded-full bg-white/10 text-center text-white">Login / Sign Up</Link>
					</div>
				</div>
			)}
			<div className="h-[2px] w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88]" />
		</header>
	);
}