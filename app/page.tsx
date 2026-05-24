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

  const [activeReservation, setActiveReservation] = useState<{
    productId: string;
    reservationId: string;
    timer: number;
  } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!activeReservation) return;

    if (activeReservation.timer <= 0) {
      cancelReservation();
      return;
    }

    const interval = setInterval(() => {
      setActiveReservation((prev) =>
        prev
          ? {
              ...prev,
              timer: prev.timer - 1,
            }
          : null
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReservation]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setMessage("Failed to fetch products");
    }
  };

  const reserveProduct = async (productId: string) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      setActiveReservation({
        productId,
        reservationId: data.reservationId,
        timer: 300,
      });

      setProducts((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                availableStock:
                  item.availableStock > 0
                    ? item.availableStock - 1
                    : 0,
              }
            : item
        )
      );

      setMessage("Reservation created successfully");
    } catch {
      setMessage("Reservation failed");
    }
  };

  const confirmReservation = async () => {
    if (!activeReservation) return;

    try {
      await fetch(
        `/api/reservations/${activeReservation.reservationId}/confirm`,
        {
          method: "POST",
        }
      );

      setMessage("Reservation confirmed");
      setActiveReservation(null);
    } catch {
      setMessage("Confirmation failed");
    }
  };

  const cancelReservation = async () => {
    if (!activeReservation) return;

    try {
      await fetch(
        `/api/reservations/${activeReservation.reservationId}/release`,
        {
          method: "POST",
        }
      );

      setProducts((prev) =>
        prev.map((item) =>
          item.productId === activeReservation.productId
            ? {
                ...item,
                availableStock: item.availableStock + 1,
              }
            : item
        )
      );

      setMessage("Reservation cancelled");
      setActiveReservation(null);
    } catch {
      setMessage("Cancellation failed");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #020617, #0f172a, #020617)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "50px",
        }}
      >
        <h1
          style={{
            fontSize: "70px",
            fontWeight: "bold",
            background:
              "linear-gradient(to right, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "10px",
          }}
        >
          Inventory Reservation
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "22px",
          }}
        >
          Multi-Warehouse Real-Time Reservation Platform
        </p>
      </div>

      {message && (
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto 30px",
            background: "rgba(30,41,59,0.7)",
            padding: "18px",
            borderRadius: "18px",
            textAlign: "center",
            fontSize: "20px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {message}
        </div>
      )}

      {activeReservation && (
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto 40px",
            background: "rgba(15,23,42,0.8)",
            padding: "18px",
            borderRadius: "18px",
            textAlign: "center",
            fontSize: "22px",
            border: "1px solid rgba(96,165,250,0.4)",
            boxShadow: "0 0 20px rgba(96,165,250,0.2)",
          }}
        >
          Reservation expires in:{" "}
          <span style={{ color: "#60a5fa" }}>
            {activeReservation.timer}
          </span>{" "}
          sec
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "35px",
          alignItems: "center",
        }}
      >
        {products.map((item) => (
          <div
            key={item.productId}
            style={{
              width: "520px",
              padding: "35px",
              borderRadius: "28px",
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <h2
              style={{
                fontSize: "46px",
                marginBottom: "12px",
                fontWeight: "bold",
              }}
            >
              {item.productName}
            </h2>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "22px",
                marginBottom: "35px",
              }}
            >
              {item.warehouseName}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                }}
              >
                Available Stock
              </span>

              <div
                style={{
                  background:
                    item.availableStock > 0
                      ? "linear-gradient(to right,#16a34a,#22c55e)"
                      : "linear-gradient(to right,#dc2626,#ef4444)",
                  padding: "14px 22px",
                  borderRadius: "14px",
                  fontSize: "28px",
                  fontWeight: "bold",
                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.3)",
                }}
              >
                {item.availableStock}
              </div>
            </div>

            <button
              onClick={() =>
                reserveProduct(item.productId)
              }
              disabled={item.availableStock === 0}
              style={{
                width: "100%",
                padding: "18px",
                background:
                  item.availableStock === 0
                    ? "#475569"
                    : "linear-gradient(to right,#2563eb,#7c3aed)",
                border: "none",
                borderRadius: "16px",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "18px",
                transition: "0.3s",
              }}
            >
              Reserve Product
            </button>

            {activeReservation?.productId ===
              item.productId && (
              <>
                <button
                  onClick={confirmReservation}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background:
                      "linear-gradient(to right,#16a34a,#22c55e)",
                    border: "none",
                    borderRadius: "14px",
                    color: "white",
                    fontSize: "22px",
                    fontWeight: "bold",
                    marginBottom: "14px",
                    cursor: "pointer",
                  }}
                >
                  Confirm Reservation
                </button>

                <button
                  onClick={cancelReservation}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background:
                      "linear-gradient(to right,#dc2626,#ef4444)",
                    border: "none",
                    borderRadius: "14px",
                    color: "white",
                    fontSize: "22px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel Reservation
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}