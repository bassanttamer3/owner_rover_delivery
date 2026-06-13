import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { login } from "@/api";
import type { AxiosError } from "axios";
import { LoginCredentials, LoginPath } from "@/common";
import type { AuthUser } from "@/common/types/auth.types";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, user, loading: authLoading } = useAuth();
  const [loginType, setLoginType] = useState<LoginPath>("fleet");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(user.password_must_change ? "/change-password" : "/dashboard", { replace: true });
  }, [authLoading, user, navigate]);

  if (!authLoading && user) {
    return null;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const data: LoginCredentials = {
        email,
        password,
      };
      const response = await login(data, loginType);
      const { user, tokens } = response.data.data;
      setAuth(
        { access_token: tokens.access_token, refresh_token: tokens.refresh_token },
        user as AuthUser,
        loginType
      );
      toast.success("Login successful");
      if (user.password_must_change) {
        navigate("/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const message = (err as AxiosError<{ message?: string }>)?.response?.data?.message ?? "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-cyan-100" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <Card className="w-full max-w-md mx-4 sm:mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-10">
        <CardHeader className="text-center space-y-6 sm:space-y-8 pb-8 sm:pb-10">
          <img src={logo} alt="ROVEX" className="h-20 sm:h-28 mx-auto" />
          <div>
            <CardTitle className="text-2xl sm:text-4xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600 text-lg">Sign in to ROVEX Platform</CardDescription>
          </div>
          <div className="flex gap-3">
            <Button
              className={loginType === "fleet" ? "bg-cyan-500 hover:bg-cyan-600 w-full" : "bg-gray-100 text-gray-700 hover:bg-gray-200 w-full"}
              onClick={() => setLoginType("fleet")}
            >
              Fleet Owner
            </Button>
            <Button
              className={loginType === "company" ? "bg-cyan-500 hover:bg-cyan-600 w-full" : "bg-gray-100 text-gray-700 hover:bg-gray-200 w-full"}
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
        <CardFooter className="justify-center">
          <Link
            to={`/${loginType}/forget-password`}
            className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            Forgot password?
          </Link>

        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;