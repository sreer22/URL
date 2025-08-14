import { PartDetailClient } from "@/components/PartDetailClient";
import { parts } from "@/lib/sample-data";

export default async function PartDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const p = await params;
  const part = parts.find((x) => x.sku === p.sku) || null;
  return <PartDetailClient part={part} />;
}