import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: params.id,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    const inventory =
      await prisma.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

    if (inventory) {
      await prisma.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock:
            inventory.reservedStock -
            reservation.quantity,
        },
      });
    }

    await prisma.reservation.update({
      where: {
        id: params.id,
      },
      data: {
        status: "RELEASED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Release failed" },
      { status: 500 }
    );
  }
}