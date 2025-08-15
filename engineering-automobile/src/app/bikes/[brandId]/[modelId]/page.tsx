import { ModelPartsClient } from "@/components/ModelPartsClient";

export default async function BikeModelPage({ params }: { params: Promise<{ brandId: string; modelId: string }> }) {
  const p = await params;
  return <ModelPartsClient brandId={p.brandId} modelId={p.modelId} />;
}