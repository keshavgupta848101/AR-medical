"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Alert } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Gradient Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-teal-300 to-green-400 animate-gradientBlur"></div>

      <div className="relative w-full max-w-md bg-white p-6 rounded-2xl shadow-lg backdrop-blur-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Medical AR Platform - Login
        </h1>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email Address"
            variant="outlined"
            fullWidth
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white"
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            className="mt-4 py-3 font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>

      {/* Tailwind Animation for Gradient */}
      <style>
        {`
          @keyframes gradientBlur {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .animate-gradientBlur {
            background-size: 200% 200%;
            animation: gradientBlur 10s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
