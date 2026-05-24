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
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load products");
      });
  }, []);

  const reserveProduct = async (productId: string) => {
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
        setMessage("✅ Reservation successful");

        setProducts((prev) =>
          prev.map((p) =>
            p.productId === productId
              ? {
                  ...p,
                  availableStock: p.availableStock - 1,
                }
              : p
          )
        );
      } else {
        setMessage(data.error || "Reservation failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold mb-4">
            Inventory Reservation System
          </h1>

          <p className="text-gray-400 text-2xl">
            Multi-Warehouse Real-Time Reservation Platform
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 text-center text-xl mb-10">
            {message}
          </div>
        )}

        {/* Product Cards */}
        <div className="flex flex-col gap-10">
          {products.map((product) => (
            <div
              key={product.productId}
              className="bg-[#111111] border border-gray-800 rounded-3xl p-10 shadow-2xl hover:scale-[1.01] transition duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                {/* Left */}
                <div>
                  <h2 className="text-5xl font-bold mb-4">
                    {product.productName}
                  </h2>

                  <p className="text-gray-400 text-2xl mb-8">
                    {product.warehouseName}
                  </p>

                  <div className="flex items-center gap-5">
                    <span className="text-2xl">Available Stock</span>

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
                </div>

                {/* Right */}
                <div>
                  <button
                    onClick={() => reserveProduct(product.productId)}
                    disabled={product.availableStock <= 0}
                    className={`px-12 py-5 rounded-2xl text-2xl font-bold transition duration-300 ${
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}