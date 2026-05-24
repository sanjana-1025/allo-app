import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

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
    availableStock: item.totalStock - item.reservedStock,
  }));

  return NextResponse.json(formatted);
}