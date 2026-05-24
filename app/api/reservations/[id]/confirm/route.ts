import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reservation.update({
      where: {
        id: params.id,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}