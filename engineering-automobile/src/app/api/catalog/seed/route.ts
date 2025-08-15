import { prisma } from "@/lib/prisma";
import { brands, models, parts } from "@/lib/sample-data";
import { NextResponse } from "next/server";

export async function POST() {
	await prisma.part.deleteMany({});
	await prisma.vehicleModel.deleteMany({});
	await prisma.brand.deleteMany({});
	for (const b of brands) {
		await prisma.brand.create({ data: { id: b.id, name: b.name, category: b.category, country: b.country } });
	}
	for (const m of models) {
		await prisma.vehicleModel.create({ data: { id: m.id, name: m.name, brandId: m.brandId } });
	}
	for (const p of parts) {
		await prisma.part.create({ data: { id: p.id, sku: p.sku, name: p.name, price: p.price, inStock: p.inStock, country: p.country, modelId: p.modelId, description: p.description } });
	}
	return NextResponse.json({ success: true });
}