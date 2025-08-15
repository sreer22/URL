"use client";
import { motion } from "framer-motion";

export function Hero({ onSearch }: { onSearch?: (q: string) => void }) {
  const go = (q: string) => {
    if (onSearch) onSearch(q);
    else if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_-10%,rgba(255,0,255,0.2),transparent),linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.5))] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Your AI-powered Automobile Expert
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-3 text-zinc-300 max-w-2xl">
          Search spare parts, models, or problems
        </motion.p>
        <div className="mt-6 max-w-xl">
          <div className="rounded-full p-[2px] bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88]">
            <div className="rounded-full bg-black/60 flex">
              <input onKeyDown={(e) => { if (e.key === 'Enter') go((e.target as HTMLInputElement).value); }} placeholder="Search spare parts, models, or problems" className="flex-1 bg-transparent outline-none px-4 py-3 text-white placeholder-zinc-400" />
              <button onClick={() => { const el = document.querySelector<HTMLInputElement>('input[placeholder*="Search spare"][placeholder*="models"]'); if (el) go(el.value); }} className="px-5 py-3 rounded-full bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88] text-black font-semibold">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}