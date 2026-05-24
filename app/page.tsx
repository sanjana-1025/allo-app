"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  availableStock: number;
}

export default function Home() {

  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);

  async function fetchProducts() {

    const res = await fetch(
      "https://allo-app-six.vercel.app/api/products",
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    setProducts(data);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {

    if (!reservationId) return;

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          setMessage("Reservation expired");

          setReservationId("");

          fetchProducts();

          return 0;
        }

        return prev - 1;
      });

    }, 1000);

    return () => clearInterval(timer);

  }, [reservationId]);

  async function reserveProduct(
    productId: string,
    warehouseId: string
  ) {

    try {

      setLoading(true);

      const res = await fetch(
        "https://allo-app-six.vercel.app/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            warehouseId,
            quantity: 1,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setMessage(data.error || "Reservation failed");

        setLoading(false);

        return;
      }

      setReservationId(data.id);

      setTimeLeft(600);

      setMessage("Reservation created successfully");

      fetchProducts();

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);

      setMessage("Something went wrong");
    }
  }

  async function confirmReservation() {

    try {

      const res = await fetch(
        `https://allo-app-six.vercel.app/api/reservations/${reservationId}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setMessage(data.error || "Confirmation failed");

        return;
      }

      setMessage("Purchase confirmed successfully");

      setReservationId("");

      fetchProducts();

    } catch (error) {

      console.log(error);

      setMessage("Something went wrong");
    }
  }

  async function cancelReservation() {

    try {

      await fetch(
        `https://allo-app-six.vercel.app/api/reservations/${reservationId}/release`,
        {
          method: "POST",
        }
      );

      setMessage("Reservation cancelled");

      setReservationId("");

      fetchProducts();

    } catch (error) {

      console.log(error);

      setMessage("Something went wrong");
    }
  }

  return (

    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">

          <h1 className="text-5xl font-extrabold mb-4">
            Inventory Reservation System
          </h1>

          <p className="text-gray-400 text-lg">
            Multi-Warehouse Real-Time Reservation Platform
          </p>

        </div>

        {message && (

          <div className="mb-8 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 text-center text-lg">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {products.map((product) => (

            <div
              key={`${product.productId}-${product.warehouseId}`}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl hover:scale-105 transition-all duration-300"
            >

              <div className="mb-4">

                <h2 className="text-3xl font-bold mb-2">
                  {product.productName}
                </h2>

                <p className="text-gray-400">
                  {product.warehouseName}
                </p>

              </div>

              <div className="flex items-center justify-between mb-6">

                <span className="text-lg">
                  Available Stock
                </span>

                <span
                  className={`px-4 py-2 rounded-xl font-bold text-lg ${
                    product.availableStock > 0
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {product.availableStock}
                </span>

              </div>

              <button
                disabled={
                  product.availableStock <= 0 || loading
                }
                onClick={() =>
                  reserveProduct(
                    product.productId,
                    product.warehouseId
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-4 py-3 rounded-2xl text-lg font-semibold transition-all"
              >
                {loading ? "Processing..." : "Reserve Product"}
              </button>

            </div>
          ))}
        </div>

        {reservationId && (

          <div className="mt-14 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-3xl mx-auto shadow-2xl">

            <h2 className="text-4xl font-bold mb-6 text-center">
              Checkout
            </h2>

            <div className="space-y-4 text-lg">

              <p>
                <span className="font-semibold">
                  Reservation ID:
                </span>
                <span className="ml-2 text-blue-400 break-all">
                  {reservationId}
                </span>
              </p>

              <p className="text-yellow-400 font-bold text-xl">
                Expires In: {timeLeft} seconds
              </p>

            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-8">

              <button
                onClick={confirmReservation}
                className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-4 rounded-2xl text-xl font-bold transition-all"
              >
                Confirm Purchase
              </button>

              <button
                onClick={cancelReservation}
                className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-4 rounded-2xl text-xl font-bold transition-all"
              >
                Cancel Reservation
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}