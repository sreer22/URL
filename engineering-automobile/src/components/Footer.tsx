export function Footer() {
	return (
		<footer className="mt-16 border-t border-white/10">
			<div className="h-[2px] w-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88]" />
			<div className="mx-auto max-w-7xl px-4 md:px-6 py-8 text-center text-zinc-400 text-sm">
				© {new Date().getFullYear()} Engineering Automobile. All rights reserved.
			</div>
		</footer>
	);
}