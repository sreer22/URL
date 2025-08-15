/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	target: z.string().min(3),
	purpose: z.enum(["login", "forgot"]),
	code: z.string().length(6),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { target, purpose, code } = schema.parse(body);
		const now = new Date();
		const otp = await prisma.otpCode.findFirst({
			where: { target, purpose, code, consumed: false, expiresAt: { gt: now } },
			orderBy: { createdAt: "desc" },
		});
		if (!otp) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

		await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 400 });
	}
}