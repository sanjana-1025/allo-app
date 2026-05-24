import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formatted = inventory.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      warehouseId: item.warehouse.id,
      warehouseName: item.warehouse.name,
      availableStock: item.availableStock,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}