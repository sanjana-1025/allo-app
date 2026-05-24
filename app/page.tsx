
"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: string;
  productName: string;
  warehouseName: string;
  availableStock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error(error);
        setMessage("Failed to fetch products");
      }
    }

    fetchProducts();
  }, []);

  async function reserveProduct(productId: string) {
    try {
      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Reservation successful");

        setProducts((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  availableStock: item.availableStock - 1,
                }
              : item
          )
        );
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error(error);
      setMessage("Reservation failed");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-extrabold mb-4">
            Inventory Reservation System
          </h1>

          <p className="text-gray-400 text-2xl">
            Multi-Warehouse Real-Time Reservation Platform
          </p>
        </div>

        {message && (
          <div className="bg-gray-800 rounded-2xl p-5 text-center mb-10 text-xl">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-10">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-10"
            >
              <h2 className="text-5xl font-bold mb-4">
                {product.productName}
              </h2>

              <p className="text-gray-400 text-2xl mb-8">
                {product.warehouseName}
              </p>

              <div className="flex items-center gap-5 mb-8">
                <span className="text-2xl">
                  Available Stock
                </span>

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                    product.availableStock > 0
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {product.availableStock}
                </div>
              </div>

              <button
                onClick={() =>
                  reserveProduct(product.productId)
                }
                disabled={product.availableStock <= 0}
                className={`w-full py-5 rounded-2xl text-2xl font-bold ${
                  product.availableStock > 0
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-700 cursor-not-allowed"
                }`}
              >
                {product.availableStock > 0
                  ? "Reserve Product"
                  : "Out of Stock"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
