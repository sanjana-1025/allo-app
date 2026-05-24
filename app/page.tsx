"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let interval: any;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

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

  const reserveProduct = async (
    productId: string,
    warehouseId: string
  ) => {
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setReservationId(data.id);
        setTimer(300);

        setMessage("Product Reserved Successfully");
        fetchProducts();
      } else {
        setMessage(data.error);
      }
    } catch {
      setMessage("Reservation failed");
    }
  };

  const confirmReservation = async () => {
    try {
      const res = await fetch(
        `/api/reservations/${reservationId}/confirm`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        setMessage("Reservation Confirmed");
        setReservationId("");
        setTimer(0);
        fetchProducts();
      }
    } catch {
      setMessage("Confirmation failed");
    }
  };

  const cancelReservation = async () => {
    try {
      const res = await fetch(
        `/api/reservations/${reservationId}/release`,
        {
          method: "POST",
        }
      );

      if (res.ok) {
        setMessage("Reservation Cancelled");
        setReservationId("");
        setTimer(0);
        fetchProducts();
      }
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
          textAlign: "center",
          fontSize: "70px",
          fontWeight: "bold",
        }}
      >
        Inventory Reservation System
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#aaa",
          fontSize: "24px",
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
            fontSize: "20px",
          }}
        >
          {message}
        </div>
      )}

      {reservationId && (
        <div
          style={{
            background: "#111827",
            padding: "25px",
            borderRadius: "20px",
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          <h2>Reservation Active</h2>

          <p
            style={{
              fontSize: "22px",
              margin: "20px 0",
            }}
          >
            Time Remaining: {timer} sec
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={confirmReservation}
              style={{
                padding: "15px 30px",
                border: "none",
                borderRadius: "12px",
                background: "green",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Confirm Reservation
            </button>

            <button
              onClick={cancelReservation}
              style={{
                padding: "15px 30px",
                border: "none",
                borderRadius: "12px",
                background: "red",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              Cancel Reservation
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {products.map((item) => (
          <div
            key={item.productId}
            style={{
              background: "#111827",
              padding: "30px",
              borderRadius: "25px",
            }}
          >
            <h2
              style={{
                fontSize: "42px",
              }}
            >
              {item.productName}
            </h2>

            <p
              style={{
                color: "#aaa",
                marginBottom: "20px",
                fontSize: "20px",
              }}
            >
              {item.warehouseName}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "30px",
              }}
            >
              <span style={{ fontSize: "24px" }}>
                Available Stock
              </span>

              <span
                style={{
                  background:
                    item.availableStock > 0
                      ? "green"
                      : "red",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                {item.availableStock}
              </span>
            </div>

            <button
              onClick={() =>
                reserveProduct(
                  item.productId,
                  item.warehouseId
                )
              }
              disabled={item.availableStock === 0}
              style={{
                width: "100%",
                padding: "18px",
                border: "none",
                borderRadius: "15px",
                background:
                  item.availableStock > 0
                    ? "#2563eb"
                    : "#475569",
                color: "white",
                fontSize: "22px",
                fontWeight: "bold",
                cursor:
                  item.availableStock > 0
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {item.availableStock > 0
                ? "Reserve Product"
                : "Out Of Stock"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}