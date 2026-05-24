import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        warehouseId,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const available =
      inventory.totalStock - inventory.reservedStock;

    if (available < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    await prisma.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedStock:
          inventory.reservedStock + quantity,
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        productId,
        warehouseId,
        quantity,
        status: "PENDING",
        expiresAt: new Date(
          Date.now() + 5 * 60 * 1000
        ),
      },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("RESERVATION ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}