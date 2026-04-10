// ============================================================
// APIエンドポイント: POST /api/chat
// リクエスト: { message: string }
// レスポンス: { answer: string; showPhone: boolean }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/chatEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = (body.message ?? "").trim();

    if (!message || message.length > 500) {
      return NextResponse.json(
        { error: "Invalid message" },
        { status: 400 }
      );
    }

    const result = await generateResponse(message);

    return NextResponse.json({
      answer: result.answer,
      showPhone: result.showPhone,
    });
  } catch (err) {
    console.error("[chat/route] error:", err);
    return NextResponse.json(
      {
        answer:
          "申し訳ございません。一時的にエラーが発生しました。\n直接お電話（0743-23-1515）にてお問い合わせください。",
        showPhone: true,
      },
      { status: 500 }
    );
  }
}
