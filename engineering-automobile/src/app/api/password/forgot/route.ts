/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	identifier: z.string().min(3),
	delivery: z.enum(["email", "sms"]),
});

export async function POST(req: Request) {
	try {
		const { identifier, delivery } = schema.parse(await req.json());
		const user = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: identifier },
					{ username: identifier },
					{ phone: identifier },
				],
			},
		});
		if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

		const target = delivery === "email" ? (user.email as string) : (user.phone as string);
		if (!target) return NextResponse.json({ error: "Target not available" }, { status: 400 });

		const res = await fetch(new URL("/api/otp/send", process.env.NEXTAUTH_URL || "http://localhost:3000"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ target, channel: delivery, purpose: "forgot" }),
		});
		if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 400 });

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 400 });
	}
}