import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: any
) {
  try {
    const id = context.params.id;

    await prisma.reservation.update({
      where: {
        id,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Confirmation failed",
      },
      {
        status: 500,
      }
    );
  }
}