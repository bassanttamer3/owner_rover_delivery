import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LayoutGrid, MapPin, Clock, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import mockRovers from "@/data/mockrovers.json";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createCompany } from "@/api";
import { CreateCompanyPayload } from "@/common";
import maplibregl, { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

function normalizeAddressText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSimilarity(input: string, candidate: string): number {
  const inputTokens = new Set(normalizeAddressText(input).split(" ").filter(Boolean));
  const candidateTokens = new Set(normalizeAddressText(candidate).split(" ").filter(Boolean));
  if (!inputTokens.size || !candidateTokens.size) return 0;

  let common = 0;
  inputTokens.forEach((token) => {
    if (candidateTokens.has(token)) common += 1;
  });

  return common / inputTokens.size;
}

const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

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
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const center = useMemo<[number, number]>(
    () => (lat !== 0 || lng !== 0 ? [lng, lat] : [31.2357, 30.0444]),
    [lat, lng],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center,
      zoom: lat !== 0 || lng !== 0 ? 15 : 10,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("click", (event) => {
      onChangeRef.current(event.lngLat.lng, event.lngLat.lat);
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [center, lat, lng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.resize();

    if (lat === 0 && lng === 0) {
      markerRef.current?.remove();
      markerRef.current = null;
      map.easeTo({ center: [31.2357, 30.0444], zoom: 10, duration: 350 });
      return;
    }

    const nextCenter: [number, number] = [lng, lat];
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#ef4444" }).setLngLat(nextCenter).addTo(map);
    } else {
      markerRef.current.setLngLat(nextCenter);
    }
    map.easeTo({ center: nextCenter, zoom: 15, duration: 350 });
  }, [lat, lng]);

  return (
    <div className="h-[280px] w-full rounded-md overflow-hidden border border-border">
      <div ref={mapContainerRef} className="h-full w-full" />
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

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type OperatingDay = (typeof daysOfWeek)[number];

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
      operating_hours: {},
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
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const [pendingOperatingHour, setPendingOperatingHour] = useState<{
    day: OperatingDay;
    open: string;
    close: string;
  }>({
    day: "monday",
    open: "09:00",
    close: "18:00",
  });

  const selectedOperatingHours = useMemo(
    () => form.locations[0]?.operating_hours ?? {},
    [form.locations],
  );
  const availableDays = useMemo(
    () => daysOfWeek.filter((day) => !selectedOperatingHours[day]),
    [selectedOperatingHours],
  );
  const locationAddress = form.locations[0]?.address ?? "";

  useEffect(() => {
    if (!availableDays.length) return;
    if (!availableDays.includes(pendingOperatingHour.day)) {
      setPendingOperatingHour((prev) => ({ ...prev, day: availableDays[0] }));
    }
  }, [availableDays, pendingOperatingHour.day]);

  useEffect(() => {
    if (!open) return;
    const address = locationAddress.trim();
    if (!address || address.length < 5) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setGeocodingLocation(true);

      try {
        const baseQuery =
          /\begypt\b|مصر/i.test(address) ? address : `${address}, Egypt`;
        const params = new URLSearchParams({
          f: "pjson",
          singleLine: baseQuery,
          countryCode: "EGY",
          maxLocations: "5",
          outFields: "Country,Addr_type,LongLabel,Match_addr",
          locationType: "rooftop",
        });

        const res = await fetch(
          `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params.toString()}`,
          { signal: controller.signal },
        );

        const data = (await res.json()) as {
          candidates?: Array<{
            score?: number;
            location?: { x?: number; y?: number };
            attributes?: { Country?: string; LongLabel?: string; Match_addr?: string };
          }>;
        };

        const egyptCandidates = (data.candidates ?? [])
          .filter(
            (item) =>
              item.attributes?.Country === "EGY" &&
              typeof item.location?.x === "number" &&
              typeof item.location?.y === "number",
          );

        const match = egyptCandidates
          .map((candidate) => {
            const candidateAddress =
              candidate.attributes?.LongLabel || candidate.attributes?.Match_addr || "";
            return {
              candidate,
              similarity: tokenSimilarity(address, candidateAddress),
            };
          })
          .sort((a, b) => {
            if (b.similarity !== a.similarity) return b.similarity - a.similarity;
            return (b.candidate.score ?? 0) - (a.candidate.score ?? 0);
          })[0]?.candidate;
        if (!match) return;

        const lat = Number(match.location?.y);
        const lng = Number(match.location?.x);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        setForm((prev) => {
          const latestAddress = prev.locations[0]?.address?.trim();
          if (latestAddress !== address) return prev;

          const currentLng = prev.locations[0]?.coordinates?.coordinates?.[0];
          const currentLat = prev.locations[0]?.coordinates?.coordinates?.[1];
          if (currentLng === lng && currentLat === lat) return prev;

          const updatedLocations = [...prev.locations];
          updatedLocations[0] = {
            ...updatedLocations[0],
            coordinates: {
              ...updatedLocations[0].coordinates,
              coordinates: [lng, lat],
            },
          };

          return { ...prev, locations: updatedLocations };
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to geocode location:", error);
        }
      } finally {
        setGeocodingLocation(false);
      }

    }, 700);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [locationAddress, open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(initialFormState);
      setPendingOperatingHour({
        day: "monday",
        open: "09:00",
        close: "18:00",
      });
    }
    onOpenChange(next);
  };

  const handleAddOperatingHour = () => {
    if (!availableDays.length) return;

    const day = pendingOperatingHour.day;
    if (selectedOperatingHours[day]) {
      toast.error("Operating hours already set for this day.");
      return;
    }

    const updatedLocations = [...form.locations];
    updatedLocations[0] = {
      ...updatedLocations[0],
      operating_hours: {
        ...(updatedLocations[0].operating_hours ?? {}),
        [day]: {
          open: pendingOperatingHour.open,
          close: pendingOperatingHour.close,
        },
      },
    };
    setForm({ ...form, locations: updatedLocations });

    const remainingDays = availableDays.filter((d) => d !== day);
    if (remainingDays.length) {
      setPendingOperatingHour((prev) => ({ ...prev, day: remainingDays[0] }));
    }
  };

  const handleRemoveOperatingHour = (day: OperatingDay) => {
    const updatedLocations = [...form.locations];
    const currentHours = { ...(updatedLocations[0].operating_hours ?? {}) };
    delete currentHours[day];
    updatedLocations[0] = {
      ...updatedLocations[0],
      operating_hours: currentHours,
    };
    setForm({ ...form, locations: updatedLocations });
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
                    <p className="text-[10px] text-muted-foreground">
                      {geocodingLocation
                        ? "Finding this address on the map..."
                        : "Typing an address will auto-select it on the map."}
                    </p>
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
                  <span>Action</span>
                </div>
                {availableDays.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 items-center">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
                      value={pendingOperatingHour.day}
                      onChange={(e) =>
                        setPendingOperatingHour((prev) => ({
                          ...prev,
                          day: e.target.value as OperatingDay,
                        }))
                      }
                    >
                      {availableDays.map((day) => (
                        <option key={day} value={day} className="capitalize">
                          {day}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="time"
                      value={pendingOperatingHour.open}
                      onChange={(e) =>
                        setPendingOperatingHour((prev) => ({
                          ...prev,
                          open: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="time"
                      value={pendingOperatingHour.close}
                      onChange={(e) =>
                        setPendingOperatingHour((prev) => ({
                          ...prev,
                          close: e.target.value,
                        }))
                      }
                    />
                    <Button type="button" variant="outline" onClick={handleAddOperatingHour}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                )}

                {daysOfWeek
                  .filter((day) => selectedOperatingHours[day])
                  .map((day) => (
                    <div key={day} className="grid grid-cols-4 gap-3 items-center">
                      <Label className="text-[10px] capitalize">{day}</Label>
                      <Input
                        type="time"
                        value={selectedOperatingHours[day]?.open ?? "09:00"}
                        onChange={(e) => {
                          const updatedLocations = [...form.locations];
                          const updatedHours = {
                            ...(updatedLocations[0].operating_hours ?? {}),
                            [day]: {
                              ...(updatedLocations[0].operating_hours?.[day] ??
                                defaultOperatingHours[day]),
                              open: e.target.value,
                            },
                          };
                          updatedLocations[0] = {
                            ...updatedLocations[0],
                            operating_hours: updatedHours,
                          };
                          setForm({ ...form, locations: updatedLocations });
                        }}
                      />
                      <Input
                        type="time"
                        value={selectedOperatingHours[day]?.close ?? "18:00"}
                        onChange={(e) => {
                          const updatedLocations = [...form.locations];
                          const updatedHours = {
                            ...(updatedLocations[0].operating_hours ?? {}),
                            [day]: {
                              ...(updatedLocations[0].operating_hours?.[day] ??
                                defaultOperatingHours[day]),
                              close: e.target.value,
                            },
                          };
                          updatedLocations[0] = {
                            ...updatedLocations[0],
                            operating_hours: updatedHours,
                          };
                          setForm({ ...form, locations: updatedLocations });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveOperatingHour(day)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}

                {!Object.keys(selectedOperatingHours).length && (
                  <p className="text-[10px] text-muted-foreground">
                    No operating hours added yet.
                  </p>
                )}
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
