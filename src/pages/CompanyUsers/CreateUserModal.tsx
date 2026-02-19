import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCompanyUser } from "@/api";
import { NewCompanyUserInterface } from "@/common";
import { UserPlus } from "lucide-react";

function isValidEmail(email: string): boolean {
  if (!email?.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function sanitizePhone(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    return "+" + trimmed.slice(1).replace(/\D/g, "");
  }
  return trimmed.replace(/\D/g, "");
}

const ROLE_OPTIONS: { value: NewCompanyUserInterface["role"]; label: string }[] = [
  { value: "company_admin", label: "Company Admin" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "store_manager", label: "Store Manager" },
  { value: "customer_support", label: "Customer Support" },
  { value: "analyst", label: "Analyst" },
];

const initialForm: NewCompanyUserInterface = {
  name: "",
  email: "",
  phone: "",
  role: "company_admin",
};

export interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateUserModal = ({ open, onOpenChange, onSuccess }: CreateUserModalProps) => {
  const [form, setForm] = useState<NewCompanyUserInterface>(initialForm);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(initialForm);
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      toast.error("Validation Error", { description: "Name is required." });
      return;
    }
    if (!form.email?.trim()) {
      toast.error("Validation Error", { description: "Email is required." });
      return;
    }
    if (!isValidEmail(form.email)) {
      toast.error("Validation Error", { description: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      await createCompanyUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        ...(form.phone?.trim() && { phone: form.phone.trim() }),
      });
      toast.success("User created successfully");
      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      toast.error("Failed to create user", {
        description: axErr.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent">
        <Card className="relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
          <CardHeader>
            <DialogTitle className="hidden">Create New User</DialogTitle>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#2ec8cf]" />
              Create User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-user-name">Name</Label>
              <Input
                id="create-user-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-user-email">Email</Label>
              <Input
                id="create-user-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-user-phone">Phone</Label>
              <Input
                id="create-user-phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value).replace(/^\+/, "") })}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm({ ...form, role: value as NewCompanyUserInterface["role"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
              >
                {loading ? "Creating…" : "Create User"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
