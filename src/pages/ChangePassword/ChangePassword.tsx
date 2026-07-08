import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
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
import { changePassword as changePasswordApi, refreshToken } from "@/api";
import type { AxiosError } from "axios";
import { ChangePasswordInterface } from "@/common";
import { useAuth } from "@/contexts/AuthContext";
import * as authStorage from "@/lib/auth-storage";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { setToken, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshAccessToken = async (): Promise<string | null> => {
    const token = authStorage.getRefreshToken();
    if (!token) return null;
    try {
      const res = await refreshToken(token);
      const newAccess = res.data?.data?.access_token;
      if (newAccess) {
        setToken(newAccess);
        return newAccess;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setLoading(true);
    try {
      const changePasswordData: ChangePasswordInterface = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };
      await changePasswordApi(changePasswordData);
      toast.success("Password updated successfully");
      updateUser({ password_must_change: false });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          toast.error("Session expired. Please login again.");
          navigate("/login", { replace: true });
          return;
        }
        try {
          const changePasswordData: ChangePasswordInterface = {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          };
          await changePasswordApi(changePasswordData);
          toast.success("Password updated successfully");
          updateUser({ password_must_change: false });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          navigate("/dashboard", { replace: true });
        } catch (retryErr) {
          toast.error(
            (retryErr as AxiosError<{ message?: string }>)?.response?.data?.message ??
              "Failed to change password"
          );
        }
      } else {
        toast.error(axiosErr.response?.data?.message ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <Card className="w-full max-w-md mx-4 sm:mx-auto shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          <img src={logo} alt="ROVEX" className="h-28 mx-auto" />
          <div>
            <CardTitle className="text-4xl font-bold">Change Password</CardTitle>
            <CardDescription className="text-lg">
              You must set a new password to continue
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
              autoComplete="new-password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
  );
};

export default ChangePassword;
