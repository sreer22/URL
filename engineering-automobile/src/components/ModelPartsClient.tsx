"use client";
import { useMemo, useState } from "react";
import { brands, models, parts } from "@/lib/sample-data";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

export function ModelPartsClient({ brandId, modelId }: { brandId: string; modelId: string }) {
  const brand = brands.find((b) => b.id === brandId);
  const model = models.find((m) => m.id === modelId);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [country, setCountry] = useState<string>("");
  const add = useCartStore((s) => s.add);
  const filtered = useMemo(() => parts.filter((p) => p.modelId === model?.id)
    .filter((p) => (inStockOnly ? p.inStock : true))
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p) => (country ? p.country === country : true)), [model?.id, inStockOnly, priceRange, country]);
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">{brand?.name} / {model?.name} Parts</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6 text-sm">
        <label className="flex items-center gap-2">In Stock <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /></label>
        <label className="flex items-center gap-2">Price {priceRange[0]} - {priceRange[1]}
          <input type="range" min={0} max={2000} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} />
          <input type="range" min={0} max={2000} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} />
        </label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="bg-transparent border border-white/10 rounded px-2 py-1">
          <option value="">All Countries</option>
          <option value="JP">Japan</option>
          <option value="DE">Germany</option>
        </select>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="border border-white/10 rounded-xl p-4">
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-zinc-400">SKU: {p.sku}</div>
            <div className="mt-2 text-sm">${p.price.toFixed(2)}</div>
            <div className="mt-2 text-xs">{p.inStock ? "In Stock" : "Out of Stock"}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => add({ sku: p.sku, name: p.name, price: p.price })} className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88] text-black font-semibold">Add to Cart</button>
              <Link href={`/parts/${p.sku}`} className="px-3 py-2 rounded-lg bg-white/10">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}