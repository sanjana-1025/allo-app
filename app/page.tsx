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
  const [timer, setTimer] = useState(0);
  const [reservationId, setReservationId] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await res.json();

      setReservationId(data.reservationId);

      setTimer(300);

      // REDUCE STOCK HERE
      setProducts((prevProducts) =>
        prevProducts.map((item) =>
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
      setMessage("Something went wrong");
    }
  };

  const confirmReservation = async () => {
    try {
      await fetch(`/api/reservations/${reservationId}/confirm`, {
        method: "POST",
      });

      setMessage("Reservation confirmed");
      setTimer(0);
    } catch {
      setMessage("Confirmation failed");
    }
  };

  const cancelReservation = async () => {
    try {
      await fetch(`/api/reservations/${reservationId}/release`, {
        method: "POST",
      });

      setMessage("Reservation cancelled");
      setTimer(0);
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
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "70px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Inventory Reservation System
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          fontSize: "22px",
          marginBottom: "40px",
        }}
      >
        Multi-Warehouse Real-Time Reservation Platform
      </p>

      {message && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
          }}
        >
          {message}
        </div>
      )}

      {timer > 0 && (
        <div
          style={{
            background: "#111827",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "24px",
          }}
        >
          Reservation expires in: {timer} sec
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          alignItems: "center",
        }}
      >
        {products.map((item) => (
          <div
            key={item.productId}
            style={{
              width: "700px",
              background: "#081028",
              padding: "40px",
              borderRadius: "25px",
            }}
          >
            <h2
              style={{
                fontSize: "60px",
                marginBottom: "10px",
              }}
            >
              {item.productName}
            </h2>

            <p
              style={{
                color: "#bbb",
                fontSize: "28px",
              }}
            >
              {item.warehouseName}
            </p>

            <div
              style={{
                marginTop: "30px",
                marginBottom: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "36px" }}>
                Available Stock
              </span>

              <div
                style={{
                  background:
                    item.availableStock > 0 ? "green" : "red",
                  padding: "20px",
                  borderRadius: "15px",
                  fontSize: "40px",
                  fontWeight: "bold",
                }}
              >
                {item.availableStock}
              </div>
            </div>

            <button
              onClick={() => reserveProduct(item.productId)}
              style={{
                width: "100%",
                padding: "22px",
                background: "#2563eb",
                border: "none",
                borderRadius: "18px",
                color: "white",
                fontSize: "32px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Reserve Product
            </button>

            {timer > 0 && (
              <>
                <button
                  onClick={confirmReservation}
                  style={{
                    width: "100%",
                    padding: "20px",
                    background: "green",
                    border: "none",
                    borderRadius: "15px",
                    color: "white",
                    fontSize: "28px",
                    marginBottom: "15px",
                    cursor: "pointer",
                  }}
                >
                  Confirm Reservation
                </button>

                <button
                  onClick={cancelReservation}
                  style={{
                    width: "100%",
                    padding: "20px",
                    background: "red",
                    border: "none",
                    borderRadius: "15px",
                    color: "white",
                    fontSize: "28px",
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