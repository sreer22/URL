/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";
import twilio from "twilio";

const schema = z.object({
	target: z.string().min(3),
	channel: z.enum(["email", "sms"]),
	purpose: z.enum(["login", "forgot"]),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { target, channel, purpose } = schema.parse(body);

		const code = Math.floor(100000 + Math.random() * 900000).toString();
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		await prisma.otpCode.create({ data: { target, channel, purpose, code, expiresAt } });

		if (channel === "email") {
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT || 587),
				secure: false,
				auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
			});
			await transporter.sendMail({
				from: process.env.SMTP_FROM,
				to: target,
				subject: `Your OTP Code`,
				text: `Your OTP is ${code}. It expires in 10 minutes.`,
			});
		} else {
			const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
			await client.messages.create({
				from: process.env.TWILIO_FROM_NUMBER!,
				to: target,
				body: `Your OTP is ${code}. It expires in 10 minutes.`,
			});
		}

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 400 });
	}
}