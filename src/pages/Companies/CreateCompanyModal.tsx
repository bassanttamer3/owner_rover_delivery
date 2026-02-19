import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutGrid, MapPin, Clock, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import mockRovers from "@/data/mockrovers.json";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCompany } from "@/api";
import { CreateCompanyPayload } from "@/common";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon in Leaflet (required when using Marker outside MapPanel)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/** Valid email format (RFC 5322 simplified) */
function isValidEmail(email: string): boolean {
  if (!email?.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/** Restrict input to digits only (optional leading + for country code) */
function sanitizePhone(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) {
    return "+" + trimmed.slice(1).replace(/\D/g, "");
  }
  return trimmed.replace(/\D/g, "");
}

/** Restrict input to positive numbers (digits and one decimal point) */
function sanitizePositiveDecimal(value: string): string {
  return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

/** Listens to map click and calls onSelect with (lng, lat) */
function MapClickHandler({
  onSelect,
}: {
  onSelect: (lng: number, lat: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onSelect(e.latlng.lng, e.latlng.lat);
    },
  });
  return null;
}

/** Map picker: click to set location; coordinates are [lng, lat] in form */
function LocationMapPicker({
  lng,
  lat,
  onChange,
}: {
  lng: number;
  lat: number;
  onChange: (lng: number, lat: number) => void;
}) {
  const center: [number, number] =
    lat !== 0 || lng !== 0 ? [lat, lng] : [30.0444, 31.2357];
  return (
    <div className="h-[280px] w-full rounded-md overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={lat !== 0 || lng !== 0 ? 15 : 10}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={onChange} />
        {(lat !== 0 || lng !== 0) && (
          <Marker position={[lat, lng]} />
        )}
      </MapContainer>
    </div>
  );
}

const defaultOperatingHours = {
  monday: { open: "09:00", close: "18:00" },
  tuesday: { open: "09:00", close: "18:00" },
  wednesday: { open: "09:00", close: "18:00" },
  thursday: { open: "09:00", close: "18:00" },
  friday: { open: "09:00", close: "18:00" },
  saturday: { open: "00:00", close: "00:00" },
  sunday: { open: "00:00", close: "00:00" },
};

const initialFormState: CreateCompanyPayload = {
  name: "",
  business_type: "logistics",
  contact: { primary_contact: "", email: "", phone: "", address: "" },
  subscription: {
    tier: "professional",
    billing_cycle: "monthly",
    pricing: {
      base_fee: 299.99,
      per_delivery_fee: 2.5,
      included_deliveries: 500,
      overage_rate: 3,
    },
  },
  locations: [
    {
      name: "Headquarters",
      address: "",
      coordinates: { type: "Point", coordinates: [31.2357, 30.0444] },
      operating_hours: defaultOperatingHours,
      is_primary: true,
      active: true,
    },
  ],
  assigned_rovers: [],
  admin_user: { name: "", email: "", phone: "", role: "company_admin" },
};

export interface CreateCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateCompanyModal = ({ open, onOpenChange, onSuccess }: CreateCompanyModalProps) => {
  const [form, setForm] = useState<CreateCompanyPayload>(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(initialFormState);
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      toast.error("Validation Error", {
        description: "Company name is required.",
      });
      return;
    }
    if (!form.contact.email?.trim()) {
      toast.error("Validation Error", {
        description: "Contact email is required.",
      });
      return;
    }
    if (!isValidEmail(form.contact.email)) {
      toast.error("Validation Error", {
        description: "Please enter a valid contact email address.",
      });
      return;
    }
    if (!form.admin_user.email?.trim()) {
      toast.error("Validation Error", {
        description: "Admin email is required.",
      });
      return;
    }
    if (!isValidEmail(form.admin_user.email)) {
      toast.error("Validation Error", {
        description: "Please enter a valid admin email address.",
      });
      return;
    }

    const baseFee = form.subscription.pricing?.base_fee ?? 0;
    const perDeliveryFee = form.subscription.pricing?.per_delivery_fee ?? 0;
    const includedDeliveries = form.subscription.pricing?.included_deliveries ?? 0;
    const overageRate = form.subscription.pricing?.overage_rate ?? 0;
    if (baseFee < 0 || perDeliveryFee < 0 || includedDeliveries < 0 || overageRate < 0) {
      toast.error("Validation Error", {
        description: "Subscription pricing values must be zero or positive.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: CreateCompanyPayload = {
        name: form.name,
        business_type: form.business_type,
        contact: {
          primary_contact: form.contact.primary_contact,
          email: form.contact.email,
          phone: form.contact.phone,
          address: form.contact.address,
        },
        subscription: {
          tier: form.subscription.tier,
          billing_cycle: form.subscription.billing_cycle,
          pricing: {
            base_fee: form.subscription.pricing?.base_fee ?? 299.99,
            per_delivery_fee: form.subscription.pricing?.per_delivery_fee ?? 2.5,
            included_deliveries: form.subscription.pricing?.included_deliveries ?? 500,
            overage_rate: form.subscription.pricing?.overage_rate ?? 3,
          },
        },
        locations: form.locations.map((loc) => ({
          name: loc.name,
          address: loc.address || form.contact.address,
          coordinates: {
            type: "Point" as const,
            coordinates: loc.coordinates.coordinates,
          },
          operating_hours: loc.operating_hours,
          is_primary: loc.is_primary,
          active: loc.active,
        })),
        assigned_rovers: form.assigned_rovers,
        admin_user: {
          name: form.admin_user.name,
          email: form.admin_user.email,
          phone: form.admin_user.phone,
          role: "company_admin" as const,
        },
      };

      const res = await createCompany(payload);
      const tempPass = res.data?.data?.admin_user?.temporary_password;

      toast.success("Company Registered Successfully!", {
        description: tempPass
          ? `Admin Temp Pass: ${tempPass}`
          : "Company is now active",
        duration: 10000,
      });

      handleOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      console.error("Payload Error:", axErr.response?.data);
      toast.error("Registration Failed", {
        description:
          axErr.response?.data?.message || "Verify all required fields",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none bg-transparent">
        <Card className="relative shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#2ec8cf]" />
          <CardHeader>
            <DialogTitle className="hidden">Register New Company</DialogTitle>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-[#2ec8cf]" />
              Register Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black">Company Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Acme Inc"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black">Business Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.business_type}
                  onChange={(e) =>
                    setForm({ ...form, business_type: e.target.value as CreateCompanyPayload["business_type"] })
                  }
                >
                  <option value="logistics">Logistics</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="campus">Campus</option>
                </select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black">Contact Person</Label>
                  <Input
                    value={form.contact.primary_contact}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contact: { ...form.contact, primary_contact: e.target.value },
                      })
                    }
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black">Contact Email</Label>
                  <Input
                    value={form.contact.email}
                    onChange={(e) =>
                      setForm({ ...form, contact: { ...form.contact, email: e.target.value } })
                    }
                    placeholder="email@corp.com"
                    type="email"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black">Contact Phone</Label>
                  <Input
                    value={form.contact.phone}
                    onChange={(e) => {
                      const v = sanitizePhone(e.target.value);
                      setForm({ ...form, contact: { ...form.contact, phone: v } });
                    }}
                    placeholder="+1234567890"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black">Office Address</Label>
                  <Input
                    value={form.contact.address}
                    onChange={(e) =>
                      setForm({ ...form, contact: { ...form.contact, address: e.target.value } })
                    }
                    placeholder="123 Street, City"
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold">Location Name</Label>
                    <Input
                      value={form.locations[0].name}
                      onChange={(e) => {
                        const newLocs = [...form.locations];
                        newLocs[0].name = e.target.value;
                        setForm({ ...form, locations: newLocs });
                      }}
                      placeholder="Headquarters"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[9px] font-bold">Location Address</Label>
                    <Input
                      value={form.locations[0].address}
                      onChange={(e) => {
                        const newLocs = [...form.locations];
                        newLocs[0].address = e.target.value;
                        setForm({ ...form, locations: newLocs });
                      }}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[9px] font-bold">Select location on map</Label>
                    <LocationMapPicker
                      key={String(open)}
                      lng={form.locations[0].coordinates.coordinates[0] ?? 0}
                      lat={form.locations[0].coordinates.coordinates[1] ?? 0}
                      onChange={(lng, lat) => {
                        const newLocs = [...form.locations];
                        newLocs[0].coordinates.coordinates[0] = lng;
                        newLocs[0].coordinates.coordinates[1] = lat;
                        setForm({ ...form, locations: newLocs });
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Longitude: {form.locations[0].coordinates.coordinates[0]?.toFixed(6) ?? "—"} · Latitude:{" "}
                      {form.locations[0].coordinates.coordinates[1]?.toFixed(6) ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-3 p-4 bg-blue-50/20 rounded-lg border border-blue-200/50">
                <h4 className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Operating Hours
                </h4>
                <div className="grid grid-cols-4 gap-3 text-[9px] font-bold text-muted-foreground uppercase">
                  <span>Day</span>
                  <span>Open</span>
                  <span>Close</span>
                  <span className="col-span-1" />
                </div>
                {(
                  [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ] as const
                ).map((day) => (
                  <div key={day} className="grid grid-cols-4 gap-3 items-center">
                    <Label className="text-[10px] capitalize">{day}</Label>
                    <Input
                      type="time"
                      value={
                        form.locations[0].operating_hours?.[day]?.open ?? "09:00"
                      }
                      onChange={(e) => {
                        const newLocs = [...form.locations];
                        const oh = {
                          ...(newLocs[0].operating_hours ?? defaultOperatingHours),
                        };
                        oh[day] = { ...oh[day], open: e.target.value };
                        newLocs[0].operating_hours = oh;
                        setForm({ ...form, locations: newLocs });
                      }}
                    />
                    <Input
                      type="time"
                      value={
                        form.locations[0].operating_hours?.[day]?.close ?? "18:00"
                      }
                      onChange={(e) => {
                        const newLocs = [...form.locations];
                        const oh = {
                          ...(newLocs[0].operating_hours ?? defaultOperatingHours),
                        };
                        oh[day] = { ...oh[day], close: e.target.value };
                        newLocs[0].operating_hours = oh;
                        setForm({ ...form, locations: newLocs });
                      }}
                    />
                    <span className="col-span-1" />
                  </div>
                ))}
              </div>

              <div className="col-span-2 space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground">
                  Subscription
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black">Tier</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.subscription.tier}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            tier: e.target.value as CreateCompanyPayload["subscription"]["tier"],
                          },
                        })
                      }
                    >
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black">Billing Cycle</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.subscription.billing_cycle}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            billing_cycle: e.target
                              .value as CreateCompanyPayload["subscription"]["billing_cycle"],
                          },
                        })
                      }
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold">Base Fee</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={form.subscription.pricing?.base_fee ?? ""}
                      onChange={(e) => {
                        const v = sanitizePositiveDecimal(e.target.value);
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            pricing: {
                              ...form.subscription.pricing,
                              base_fee: parseFloat(v) || 0,
                              per_delivery_fee:
                                form.subscription.pricing?.per_delivery_fee ?? 2.5,
                              included_deliveries:
                                form.subscription.pricing?.included_deliveries ?? 500,
                              overage_rate:
                                form.subscription.pricing?.overage_rate ?? 3,
                            },
                          },
                        });
                      }}
                      placeholder="299.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold">Per Delivery Fee</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={form.subscription.pricing?.per_delivery_fee ?? ""}
                      onChange={(e) => {
                        const v = sanitizePositiveDecimal(e.target.value);
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            pricing: {
                              ...form.subscription.pricing,
                              base_fee:
                                form.subscription.pricing?.base_fee ?? 299.99,
                              per_delivery_fee: parseFloat(v) || 0,
                              included_deliveries:
                                form.subscription.pricing?.included_deliveries ?? 500,
                              overage_rate:
                                form.subscription.pricing?.overage_rate ?? 3,
                            },
                          },
                        });
                      }}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold">Included Deliveries</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={form.subscription.pricing?.included_deliveries ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, ""); // digits only, positive integer
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            pricing: {
                              ...form.subscription.pricing,
                              base_fee:
                                form.subscription.pricing?.base_fee ?? 299.99,
                              per_delivery_fee:
                                form.subscription.pricing?.per_delivery_fee ?? 2.5,
                              included_deliveries: parseInt(v, 10) || 0,
                              overage_rate:
                                form.subscription.pricing?.overage_rate ?? 3,
                            },
                          },
                        });
                      }}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold">Overage Rate</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={form.subscription.pricing?.overage_rate ?? ""}
                      onChange={(e) => {
                        const v = sanitizePositiveDecimal(e.target.value);
                        setForm({
                          ...form,
                          subscription: {
                            ...form.subscription,
                            pricing: {
                              ...form.subscription.pricing,
                              base_fee:
                                form.subscription.pricing?.base_fee ?? 299.99,
                              per_delivery_fee:
                                form.subscription.pricing?.per_delivery_fee ?? 2.5,
                              included_deliveries:
                                form.subscription.pricing?.included_deliveries ?? 500,
                              overage_rate: parseFloat(v) || 0,
                            },
                          },
                        });
                      }}
                      placeholder="3"
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] uppercase font-black">
                  Assigned Rovers
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal h-10"
                    >
                      <span className="truncate">
                        {form.assigned_rovers.length === 0
                          ? "Select rovers..."
                          : `${form.assigned_rovers.length} rover${form.assigned_rovers.length === 1 ? "" : "s"} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-2"
                    align="start"
                  >
                    <div className="max-h-60 overflow-auto space-y-2">
                      {(mockRovers as { id: string; name: string }[]).map(
                        (rover) => (
                          <label
                            key={rover.id}
                            className="flex items-center gap-2 cursor-pointer rounded-sm px-2 py-1.5 hover:bg-muted/50 text-sm"
                          >
                            <Checkbox
                              checked={form.assigned_rovers.includes(rover.id)}
                              onCheckedChange={(checked) => {
                                setForm({
                                  ...form,
                                  assigned_rovers: checked
                                    ? [...form.assigned_rovers, rover.id]
                                    : form.assigned_rovers.filter(
                                        (id) => id !== rover.id
                                      ),
                                });
                              }}
                            />
                            <span className="truncate">{rover.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {rover.id}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-[10px] text-muted-foreground">
                  Select one or more rovers to assign to this company
                </p>
              </div>
              <div className="col-span-2 space-y-3 pt-2">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground border-b pb-1">
                  System Administrator
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Admin Name"
                    value={form.admin_user.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        admin_user: {
                          ...form.admin_user,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="Admin Email"
                    type="email"
                    autoComplete="email"
                    value={form.admin_user.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        admin_user: {
                          ...form.admin_user,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="+1234567890"
                    inputMode="tel"
                    value={form.admin_user.phone}
                    onChange={(e) => {
                      const v = sanitizePhone(e.target.value);
                      setForm({
                        ...form,
                        admin_user: {
                          ...form.admin_user,
                          phone: v,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#2ec8cf] text-white"
              >
                {loading ? "Processing..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyModal;
