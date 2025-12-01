import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-8 max-w-xl mx-auto">

      {/* Login Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Login
          </CardTitle>
          <CardDescription>Enter your login credentials</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginEmail">Email</Label>
            <Input id="loginEmail" type="email" placeholder="your@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loginPassword">Password</Label>
            <Input id="loginPassword" type="password" placeholder="••••••••" />
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Login
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" placeholder="New password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Update Password
          </Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default Settings;
