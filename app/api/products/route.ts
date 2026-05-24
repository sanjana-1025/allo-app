import { NextResponse } from "next/server";

export async function GET() {
  const products = [
    {
      productId: "1",
      productName: "iPhone 15",
      warehouseId: "w1",
      warehouseName: "Hyderabad Warehouse",
      availableStock: 5,
    },
    {
      productId: "2",
      productName: "MacBook Pro",
      warehouseId: "w2",
      warehouseName: "Bangalore Warehouse",
      availableStock: 5,
    },
  ];

  return NextResponse.json(products);
}