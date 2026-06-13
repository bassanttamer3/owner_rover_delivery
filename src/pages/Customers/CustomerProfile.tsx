import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  Hash,
  Mail,
  Pencil,
  Phone,
  Save,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getCustomerDetails, updateCustomerData } from "@/api/customers/customers";
import { Customer } from "@/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const valueText = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

const CustomerProfile = () => {
  const { customer_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchCustomer = async () => {
    if (!customer_id) return;
    try {
      setLoading(true);
      const res = await getCustomerDetails(customer_id);
      const data = res?.data?.data;
      const resolvedCustomer = data?.customer ?? data?.data ?? data ?? null;
      setCustomer(resolvedCustomer);
      setFormData({
        name: resolvedCustomer?.name ?? "",
        email: resolvedCustomer?.email ?? "",
        phone: resolvedCustomer?.phone ?? "",
      });
    } catch {
      toast.error("Failed to fetch customer details");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customer_id]);

  const billingEntries = useMemo(() => {
    if (!customer?.billing || typeof customer.billing !== "object") return [];
    return Object.entries(customer.billing as Record<string, unknown>);
  }, [customer?.billing]);

  const handleUpdateCustomer = async () => {
    if (!customer_id || !customer) return;
    try {
      setSaveLoading(true);
      await updateCustomerData(customer_id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
            }
          : prev,
      );
      setIsEditing(false);
      toast.success("Customer updated successfully");
    } catch {
      toast.error("Failed to update customer");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: customer?.name ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 pt-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="pt-16 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name || "Customer Profile"}</h1>
          <p className="text-sm text-muted-foreground">Customer details and billing overview</p>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={saveLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateCustomer}
              disabled={saveLoading}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Customer Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Identity
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <p className="font-mono text-xs break-all">{valueText(customer.stripeCustomerId)}</p>
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={saveLoading}
                    className="h-8"
                  />
                ) : (
                  <p>{valueText(customer.name)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={saveLoading}
                    className="h-8"
                  />
                ) : (
                  <p>{valueText(customer.email)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={saveLoading}
                    className="h-8"
                  />
                ) : (
                  <p>{valueText(customer.phone)}</p>
                )}
              </div>
              <div className="grid grid-cols-[20px_1fr] items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p>Created: {formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground">Default Method</p>
                <Badge variant="outline" className="max-w-[70%] truncate">
                  {valueText(customer.defaultPaymentMethod)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Billing Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing data available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billingEntries.map(([key, value]) => (
                <div key={key} className="rounded-md border bg-muted/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{key}</p>
                  <p className="text-sm font-medium break-words mt-1">{valueText(value)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
