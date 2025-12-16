// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const BASE_URL = "https://100.48.4.149/auth/api/v1";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/fleet/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.status !== "success") {
        setError(data.message || "Login failed");
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // حفظ التوكنز في sessionStorage (علشان يتمسح لما تقفلي المتصفح)
      sessionStorage.setItem("accessToken", data.data.tokens.access_token);
      sessionStorage.setItem("refreshToken", data.data.tokens.refresh_token);

      toast.success("Login successful! Welcome back");

      navigate("/", { replace: true });
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Connection failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* خلفية Gradient أنيقة */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-cyan-100" />

      {/* زخرفة خفيفة (دواير blur) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* الكارد الرئيسية */}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-10">
        <CardHeader className="text-center space-y-8 pb-10">
          {/* اللوجو من public/logo.png */}
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="ROVEX Logo"
              className="h-32 w-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Welcome */}
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Sign in to manage your delivery fleet
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="habibasamy2016@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base"
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12 text-lg font-semibold bg-cyan-500 hover:bg-cyan-600 shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {error && (
            <p className="text-center text-sm text-red-600 font-medium">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;