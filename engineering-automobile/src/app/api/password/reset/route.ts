/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";

const schema = z.object({
	identifier: z.string().min(3),
	code: z.string().length(6),
	newPassword: z.string().min(8),
});

export async function POST(req: Request) {
	try {
		const { identifier, code, newPassword } = schema.parse(await req.json());
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

		const otp = await prisma.otpCode.findFirst({
			where: {
				consumed: true,
				purpose: "forgot",
				target: { in: [user.email ?? "", user.phone ?? ""] },
				code,
				expiresAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
			},
		});
		if (!otp) return NextResponse.json({ error: "OTP not verified" }, { status: 400 });

		await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 400 });
	}
}