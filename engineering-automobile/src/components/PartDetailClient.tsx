"use client";
import { Part } from "@/lib/sample-data";
import { useCartStore } from "@/store/cart";

export function PartDetailClient({ part }: { part: Part | null }) {
  const add = useCartStore((s) => s.add);
  if (!part) return <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">Part not found.</div>;
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
      <h1 className="text-2xl font-bold">{part.name}</h1>
      <div className="text-sm text-zinc-400">SKU: {part.sku}</div>
      <p className="mt-3 text-zinc-300">{part.description || "No description available."}</p>
      <div className="mt-4 text-lg font-semibold">${part.price.toFixed(2)}</div>
      <button onClick={() => add({ sku: part.sku, name: part.name, price: part.price })} className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88] text-black font-semibold">Add to Cart</button>
    </div>
  );
}