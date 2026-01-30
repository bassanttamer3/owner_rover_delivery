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
import axios from "axios";

const BASE_URL = "https://rovex.click/auth/api/v1";

const Login = () => {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("fleet"); // fleet | company
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        loginType === "fleet"
          ? "/auth/fleet/login"
          : "/auth/company/login";

      const response = await axios.post(
        `${BASE_URL}${endpoint}`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { user, tokens } = response.data.data;

      // Save data
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("user_type", loginType);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");

      navigate("/", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-cyan-100" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-10">

        <CardHeader className="text-center space-y-8 pb-10">

          <img
            src="/logo.png"
            alt="ROVEX"
            className="h-28 mx-auto"
          />

          <div>
            <CardTitle className="text-4xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Sign in to ROVEX Platform
            </CardDescription>
          </div>

          {/* Login Type Switch */}
          <div className="flex gap-3">
            <Button
              className={`w-full ${
                loginType === "fleet"
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setLoginType("fleet")}
            >
              Fleet Owner
            </Button>

            <Button
              className={`w-full ${
                loginType === "company"
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setLoginType("company")}
            >
              Company
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="manager@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 text-lg bg-cyan-500 hover:bg-cyan-600"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
