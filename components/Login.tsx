"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole, UserPlus } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "register" && (!name || !business)) {
      setError("Please complete all required fields.");
      return;
    }

    /*
     * Temporary local authentication.
     *
     * This prevents the app from automatically logging everybody in.
     * We will replace this with Supabase authentication once the rest
     * of the application is stable.
     */
    const users = JSON.parse(
      localStorage.getItem("mc-users") || "[]"
    );

    if (mode === "register") {
      const exists = users.some(
        (user: any) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        setError("An account with this email already exists.");
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        business,
        email,
        password,
      };

      localStorage.setItem(
        "mc-users",
        JSON.stringify([...users, user])
      );

      localStorage.setItem(
        "mc-session",
        JSON.stringify({
          id: user.id,
          name: user.name,
          business: user.business,
          email: user.email,
        })
      );

      // New accounts start with NO transactions.
      localStorage.removeItem("mc-transactions");

      window.location.href = "/dashboard";
      return;
    }

    const user = users.find(
      (u: any) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password
    );

    if (!user) {
      setError(
        "No account was found with those details. Please register first."
      );
      return;
    }

    localStorage.setItem(
      "mc-session",
      JSON.stringify({
        id: user.id,
        name: user.name,
        business: user.business,
        email: user.email,
      })
    );

    window.location.href = "/dashboard";
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <Link href="/" className="brand">
          <span className="brand-mark">M</span>
          <span>
            Money <b>Clarity</b>
          </span>
        </Link>

        <div className="auth-icon">
          {mode === "login" ? (
            <LockKeyhole size={22} />
          ) : (
            <UserPlus size={22} />
          )}
        </div>

        <h1>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <p>
          {mode === "login"
            ? "Sign in to your business money cockpit."
            : "Start understanding your business money."}
        </p>

        {error && (
          <div
            style={{
              padding: "12px 14px",
              marginBottom: "16px",
              borderRadius: "10px",
              background: "#fff1ed",
              color: "#a83218",
              fontSize: "14px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {mode === "register" && (
            <>
              <label>
                Your name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Naqi Abbas"
                />
              </label>

              <label>
                Business name
                <input
                  type="text"
                  required
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Acme Services"
                />
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="button primary full" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="demo-link"
          onClick={() => {
            const demoUser = {
              id: "demo-user",
              name: "Demo User",
              business: "Demo Business",
              email: "demo@moneyclarity.app",
            };

            localStorage.setItem(
              "mc-session",
              JSON.stringify(demoUser)
            );

            window.location.href = "/dashboard";
          }}
          style={{
            background: "none",
            border: "none",
            width: "100%",
            cursor: "pointer",
            font: "inherit",
          }}
        >
          Continue with demo data
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            marginTop: "14px",
            color: "inherit",
            font: "inherit",
          }}
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Sign in"}
        </button>

        <Link href="/" className="back">
          <ArrowLeft size={15} />
          Back to home
        </Link>

      </div>
    </main>
  );
}
