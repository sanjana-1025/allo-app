"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setMessage("Failed to fetch products"));
  }, []);

  const reserveProduct = async (id: string) => {
    const updatedProducts = products.map((item) => {
      if (item.productId === id && item.availableStock > 0) {
        return {
          ...item,
          availableStock: item.availableStock - 1,
        };
      }
      return item;
    });

    setProducts(updatedProducts);
    setMessage("Product reserved successfully");
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
          marginBottom: "50px",
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
            marginBottom: "40px",
            fontSize: "20px",
          }}
        >
          {message}
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
              border: "1px solid #333",
            }}
          >
            <h2
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              {item.productName}
            </h2>

            <p
              style={{
                color: "#aaa",
                marginBottom: "30px",
                fontSize: "20px",
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
              <span style={{ fontSize: "28px" }}>
                Available Stock
              </span>

              <span
                style={{
                  background:
                    item.availableStock > 0 ? "green" : "red",
                  padding: "12px 22px",
                  borderRadius: "15px",
                  fontWeight: "bold",
                  fontSize: "25px",
                }}
              >
                {item.availableStock}
              </span>
            </div>

            <button
              onClick={() =>
                reserveProduct(item.productId)
              }
              disabled={item.availableStock === 0}
              style={{
                width: "100%",
                padding: "18px",
                borderRadius: "15px",
                border: "none",
                background:
                  item.availableStock > 0
                    ? "#2563eb"
                    : "#475569",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                cursor:
                  item.availableStock > 0
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {item.availableStock > 0
                ? "Reserve Product"
                : "Out of Stock"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}