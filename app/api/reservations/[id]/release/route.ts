import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: any
) {

  try {

    const reservationId = context.params.id;

    const reservation =
      await prisma.reservation.findFirst({
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

    await prisma.inventory.updateMany({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
      data: {
        reservedStock: {
          decrement: reservation.quantity,
        },
      },
    });

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "RELEASED",
        },
      });

    return NextResponse.json(updatedReservation);

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}