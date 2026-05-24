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

    const products = inventory.map((item) => ({
      productId: item.product.id,
      warehouseId: item.warehouse.id,
      productName: item.product.name,
      warehouseName: item.warehouse.name,

      availableStock:
        item.totalStock -
        item.reservedStock,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.log("PRODUCT FETCH ERROR:", error);

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