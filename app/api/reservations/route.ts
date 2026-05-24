import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const result = await prisma.$transaction(async (tx) => {

      const inventoryRows = await tx.$queryRawUnsafe(`
        SELECT *
        FROM "Inventory"
        WHERE "productId" = '${productId}'
        AND "warehouseId" = '${warehouseId}'
        FOR UPDATE
      `);

      const inventory = (inventoryRows as any[])[0];

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      const available =
        inventory.totalStock - inventory.reservedStock;

      if (available < quantity) {

        return NextResponse.json(
          { error: "Not enough stock" },
          { status: 409 }
        );
      }

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
        },
      });

      return reservation;
    });

    return NextResponse.json(result);

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}