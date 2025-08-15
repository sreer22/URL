export type Brand = { id: string; name: string; category: "bikes" | "cars"; country?: string };
export type VehicleModel = { id: string; name: string; brandId: string };
export type Part = { id: string; sku: string; name: string; price: number; inStock: boolean; country?: string; modelId: string; description?: string };

export const brands: Brand[] = [
	{ id: "b-yamaha", name: "Yamaha", category: "bikes", country: "JP" },
	{ id: "b-honda", name: "Honda", category: "bikes", country: "JP" },
	{ id: "c-toyota", name: "Toyota", category: "cars", country: "JP" },
	{ id: "c-bmw", name: "BMW", category: "cars", country: "DE" },
];

export const models: VehicleModel[] = [
	{ id: "m-r15", name: "R15", brandId: "b-yamaha" },
	{ id: "m-fz", name: "FZ", brandId: "b-yamaha" },
	{ id: "m-hornet", name: "Hornet", brandId: "b-honda" },
	{ id: "m-civic", name: "Civic", brandId: "c-toyota" },
	{ id: "m-corolla", name: "Corolla", brandId: "c-toyota" },
	{ id: "m-3series", name: "3 Series", brandId: "c-bmw" },
];

export const parts: Part[] = [
	{ id: "p-1", sku: "YAM-R15-CHAIN", name: "Drive Chain", price: 49.99, inStock: true, modelId: "m-r15", description: "High tensile strength chain for R15" },
	{ id: "p-2", sku: "YAM-FZ-BRKPAD", name: "Brake Pads", price: 19.99, inStock: true, modelId: "m-fz", description: "Ceramic pads for smooth braking" },
	{ id: "p-3", sku: "HON-HOR-AIRFLT", name: "Air Filter", price: 12.5, inStock: false, modelId: "m-hornet", description: "OEM grade filter" },
	{ id: "p-4", sku: "TOY-CVC-OILFLT", name: "Oil Filter", price: 14.0, inStock: true, modelId: "m-civic", description: "Long-life oil filter" },
	{ id: "p-5", sku: "TOY-COR-SPRK", name: "Spark Plug", price: 9.99, inStock: true, modelId: "m-corolla", description: "Iridium spark plug" },
	{ id: "p-6", sku: "BMW-3S-BAT", name: "Battery", price: 159.99, inStock: true, modelId: "m-3series", description: "AGM car battery" },
];