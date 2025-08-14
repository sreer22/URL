"use client";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { motion } from "framer-motion";

export default function HomePage() {
	return (
		<div>
			<Hero />
			<section className="mx-auto max-w-7xl px-4 md:px-6 py-12 grid md:grid-cols-2 gap-6">
				<motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-transparent">
					<h3 className="text-xl font-bold">Bikes</h3>
					<p className="text-zinc-400 mt-2">Explore brands, models, and spare parts</p>
					<Link href="/bikes" className="mt-4 inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20">Browse Bikes →</Link>
				</motion.div>
				<motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-transparent">
					<h3 className="text-xl font-bold">Cars</h3>
					<p className="text-zinc-400 mt-2">Explore brands, models, and spare parts</p>
					<Link href="/cars" className="mt-4 inline-block px-4 py-2 rounded-full bg-white/10 hover:bg-white/20">Browse Cars →</Link>
				</motion.div>
			</section>
		</div>
	);
}