"use client";
import Link from "next/link";
import { brands, models } from "@/lib/sample-data";

export default function BikesPage() {
	const bikeBrands = brands.filter((b) => b.category === "bikes");
	return (
		<div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
			<h1 className="text-2xl font-bold mb-4">Bikes</h1>
			<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
				{bikeBrands.map((b) => (
					<div key={b.id} className="border border-white/10 rounded-xl p-4">
						<h3 className="font-semibold">{b.name}</h3>
						<div className="mt-2 flex flex-wrap gap-2">
							{models.filter((m) => m.brandId === b.id).map((m) => (
								<Link key={m.id} className="px-3 py-1 rounded-full bg-white/10 text-sm" href={`/bikes/${b.id}/${m.id}`}>{m.name}</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}