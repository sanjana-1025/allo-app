import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  return NextResponse.json({
    success: true,
    reservationId: Date.now().toString(),
    productId: body.productId,
    expiresIn: 300,
  });
}