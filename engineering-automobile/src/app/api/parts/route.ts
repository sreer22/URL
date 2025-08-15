import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const min = Number(searchParams.get("min") || 0);
  const max = Number(searchParams.get("max") || 100000);
  const inStockParam = searchParams.get("inStock");
  const inStock = inStockParam === null ? undefined : inStockParam === "true";
  const country = searchParams.get("country") || undefined;
  const modelId = searchParams.get("modelId") || undefined;
  const where = {
    price: { gte: min, lte: max },
    ...(inStock !== undefined ? { inStock } : {}),
    ...(country ? { country } : {}),
    ...(modelId ? { modelId } : {}),
  };
  const list = await prisma.part.findMany({ where });
  return NextResponse.json(list);
}