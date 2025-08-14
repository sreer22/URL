"use client";
import { useMemo, useState } from "react";
import { parts, models } from "@/lib/sample-data";
import Link from "next/link";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const query = q.toLowerCase();
    return parts.filter((p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || (models.find((m) => m.id === p.modelId)?.name.toLowerCase().includes(query) || false));
  }, [q]);
  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search spare parts, models, or problems" className="w-full bg-transparent border border-white/10 rounded px-3 py-2" />
      <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((p) => (
          <Link key={p.sku} href={`/parts/${p.sku}`} className="border border-white/10 rounded-xl p-4">
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-zinc-400">SKU: {p.sku}</div>
            <div className="mt-2 text-sm">${p.price.toFixed(2)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}