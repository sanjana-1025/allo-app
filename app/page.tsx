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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://allo-app-six.vercel.app/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Inventory Dashboard
      </h1>

      {loading ? (
        <p className="text-center text-xl">Loading...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.productId}
              className="border border-gray-700 rounded-2xl p-6 bg-zinc-900 shadow-lg"
            >
              <h2 className="text-2xl font-semibold mb-2">
                {product.productName}
              </h2>

              <p className="text-gray-400 mb-2">
                Warehouse: {product.warehouseName}
              </p>

              <div className="flex items-center justify-between mt-4">
                <span className="text-lg">Available Stock</span>

                <span
                  className={`px-4 py-2 rounded-xl font-bold ${
                    product.availableStock > 0
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {product.availableStock}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}