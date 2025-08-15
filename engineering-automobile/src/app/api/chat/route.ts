/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import OpenAI from "openai";
import { offlineFaq } from "./offline-faq";

const SYSTEM_PROMPT = `You are an expert automobile mechanic assistant. Diagnose issues for bikes and cars based on symptoms, suggest likely causes and step-by-step fixes, and list relevant spare parts with generic names. Keep answers concise. Support Tamil, English, Hindi, and Malayalam. If offline or without internet, provide general guidance from common knowledge.`;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { language, messages } = body as { language: string; messages: { role: string; content: string }[] };

    let replyContent = "";
    const last = messages[messages.length - 1]?.content || "";
    const offline = offlineFaq.find((f) => f.q.test(last));
    if (!process.env.OPENAI_API_KEY) {
      replyContent = offline?.a || "Basic guidance: Check battery connections, fuel level, air filter, and error lights. Ensure regular maintenance. (Set OPENAI_API_KEY for AI responses)";
    } else {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          ],
        });
        replyContent = completion.choices[0]?.message?.content || offline?.a || "";
      } catch {
        replyContent = offline?.a || "Temporarily unable to reach AI. Try again later.";
      }
    }

    await prisma.chatMessage.create({ data: { userId: (session.user as any).id, role: "user", language, content: last } });
    await prisma.chatMessage.create({ data: { userId: (session.user as any).id, role: "assistant", language, content: replyContent } });
    return NextResponse.json({ reply: replyContent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}