import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {

    const reservationId = params.id;

    const result = await prisma.$transaction(async (tx) => {

      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

      if (!reservation) {

        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 }
        );
      }

      if (reservation.status !== "PENDING") {

        return NextResponse.json(
          { error: "Reservation already processed" },
          { status: 400 }
        );
      }

      if (new Date() > reservation.expiresAt) {

        return NextResponse.json(
          { error: "Reservation expired" },
          { status: 410 }
        );
      }

      const inventory = await tx.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      await tx.inventory.updateMany({
  where: {
    productId: reservation.productId,
    warehouseId: reservation.warehouseId,
  },
  data: {
    totalStock: {
      decrement: reservation.quantity,
    },
    reservedStock: {
      decrement: reservation.quantity,
    },
  },
});

      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "CONFIRMED",
          },
        });

      return updatedReservation;
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