"use client";

import { useState } from "react";
import { getCurrentAdmin, login, logout } from "@/lib/api/auth";
import type { Admin } from "@/types/auth";

export default function AuthTestPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    try {
      const response = await login({
        username,
        password,
      });

      setAdmin(response.admin);
      setMessage("Login berhasil");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Login gagal",
      );
    }
  }

  async function handleMe() {
    try {
      const response = await getCurrentAdmin();

      setAdmin(response.admin);
      setMessage("Session valid");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Session tidak valid",
      );
    }
  }

  async function handleLogout() {
    try {
      await logout();

      setAdmin(null);
      setMessage("Logout berhasil");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Logout gagal",
      );
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Auth Test</h1>

      <div>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
        />
      </div>

      <div>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleMe}>Check Me</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <p>{message}</p>

      {admin && (
        <pre>
          {JSON.stringify(admin, null, 2)}
        </pre>
      )}
    </main>
  );
}