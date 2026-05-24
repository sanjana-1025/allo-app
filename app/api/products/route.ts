import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formatted = inventory.map((item: any) => ({
      productId: item.product.id,
      productName: item.product.name,
      warehouseName: item.warehouse.name,
      availableStock:
        item.availableStock ??
        item.stock ??
        item.quantity ??
        0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("PRODUCT FETCH ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}