import { useState } from "react";
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
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { changePassword as changePasswordApi, refreshToken } from "@/api";
import type { AxiosError } from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const refreshAccessToken = async (): Promise<string | null> => {
    const token = localStorage.getItem("refresh_token");
    if (!token) return null;
    try {
      const res = await refreshToken(token);
      const newAccess = res.data?.data?.access_token;
      if (newAccess) localStorage.setItem("access_token", newAccess);
      return newAccess ?? null;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    try {
      await changePasswordApi(currentPassword, newPassword, confirmPassword);
      toast.success("Password updated successfully 🔐");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        try {
          await changePasswordApi(currentPassword, newPassword, confirmPassword);
          toast.success("Password updated successfully 🔐");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } catch (retryErr) {
          toast.error((retryErr as AxiosError<{ message?: string }>)?.response?.data?.message ?? "Failed to change password");
        }
      } else {
        toast.error(axiosErr.response?.data?.message ?? "Something went wrong");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto pt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ display: "none" }}>
            <input type="text" name="fake-username" autoComplete="username" />
            <input type="password" name="fake-password" autoComplete="current-password" />
          </div>
          <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button onClick={handleChangePassword} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
