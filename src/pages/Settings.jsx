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
import { Shield } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = "https://100.48.4.149/auth/api/v1";

const Settings = () => {
  const navigate = useNavigate();

  // ============== CHANGE PASSWORD STATE ==============
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ============== REFRESH TOKEN ==============
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await res.json();

      if (!res.ok) return null;

      localStorage.setItem("accessToken", data.data.access_token);
      return data.data.access_token;
    } catch (err) {
      console.error("Refresh token error:", err);
      return null;
    }
  };

  // ============== CHANGE PASSWORD HANDLER ==============
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    try {
      let accessToken = localStorage.getItem("accessToken");

      let res = await fetch(`${BASE_URL}/auth/fleet/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      if (res.status === 401) {
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }

        res = await fetch(`${BASE_URL}/auth/fleet/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        toast.error(data?.message || "Failed to change password");
        return;
      }

      toast.success("Password updated successfully 🔐");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {
      console.error("Change password error:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto pt-8">
      {/* ============ CHANGE PASSWORD ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>

        <CardContent>
          {/* خدعة لتضليل Chrome autofill - حقول مخفية في الأول */}
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

              <Button
                onClick={handleChangePassword}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
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