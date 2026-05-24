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

      // reduce stock
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

      // restore stock
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
        background: "black",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "55px",
          fontWeight: "bold",
          marginBottom: "10px",
        }}
      >
        Inventory Reservation System
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          marginBottom: "30px",
          fontSize: "18px",
        }}
      >
        Multi-Warehouse Real-Time Reservation Platform
      </p>

      {message && (
        <div
          style={{
            background: "#1e293b",
            padding: "15px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "18px",
          }}
        >
          {message}
        </div>
      )}

      {activeReservation && (
        <div
          style={{
            background: "#111827",
            padding: "15px",
            borderRadius: "12px",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "20px",
          }}
        >
          Reservation expires in: {activeReservation.timer} sec
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "25px",
        }}
      >
        {products.map((item) => (
          <div
            key={item.productId}
            style={{
              width: "500px",
              background: "#081028",
              padding: "30px",
              borderRadius: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "42px",
                marginBottom: "10px",
              }}
            >
              {item.productName}
            </h2>

            <p
              style={{
                color: "#bbb",
                fontSize: "22px",
                marginBottom: "25px",
              }}
            >
              {item.warehouseName}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <span style={{ fontSize: "28px" }}>
                Available Stock
              </span>

              <div
                style={{
                  background:
                    item.availableStock > 0
                      ? "green"
                      : "red",
                  padding: "15px 20px",
                  borderRadius: "12px",
                  fontSize: "28px",
                  fontWeight: "bold",
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
                    ? "gray"
                    : "#2563eb",
                border: "none",
                borderRadius: "14px",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "15px",
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
                    background: "green",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "22px",
                    marginBottom: "12px",
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
                    background: "red",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "22px",
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