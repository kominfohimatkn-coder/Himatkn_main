"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api/health";

export default function HomePage() {
  const [status, setStatus] = useState("Checking API...");
  const [error, setError] = useState("");

  useEffect(() => {
    getHealth()
      .then((data) => {
        setStatus(data.status);
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  return (
    <main>
      <h1>HIMATKN</h1>

      <p>
        API Status: {error || status}
      </p>
    </main>
  );
}