import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { UpdateCompanyLocation } from "@/common";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import maplibregl, { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const DEFAULT_LOCATION_COORDINATES: [number, number] = [31.2357, 30.0444];
const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
type OperatingDay = (typeof DAYS_OF_WEEK)[number];
const DEFAULT_OPERATING_HOURS: Record<OperatingDay, { open: string; close: string }> = {
  monday: { open: "09:00", close: "18:00" },
  tuesday: { open: "09:00", close: "18:00" },
  wednesday: { open: "09:00", close: "18:00" },
  thursday: { open: "09:00", close: "18:00" },
  friday: { open: "09:00", close: "18:00" },
  saturday: { open: "00:00", close: "00:00" },
  sunday: { open: "00:00", close: "00:00" },
};
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

export const normalizeOperatingHours = (
  hours?: Record<string, { open: string; close: string }>,
): Partial<Record<OperatingDay, { open: string; close: string }>> => {
  if (!hours) return {};
  return Object.entries(hours).reduce<Partial<Record<OperatingDay, { open: string; close: string }>>>(
    (acc, [rawDay, value]) => {
      const day = rawDay.toLowerCase() as OperatingDay;
      if (!DAYS_OF_WEEK.includes(day)) return acc;
      acc[day] = {
        open: value?.open ?? DEFAULT_OPERATING_HOURS[day].open,
        close: value?.close ?? DEFAULT_OPERATING_HOURS[day].close,
      };
      return acc;
    },
    {},
  );
};

export const createDefaultLocationForm = (): UpdateCompanyLocation => ({
  name: "",
  address: "",
  coordinates: { type: "Point", coordinates: [...DEFAULT_LOCATION_COORDINATES] as [number, number] },
  operating_hours: {},
  is_primary: false,
  active: true,
});

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
    () => (lat !== 0 || lng !== 0 ? [lng, lat] : DEFAULT_LOCATION_COORDINATES),
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
      map.easeTo({ center: DEFAULT_LOCATION_COORDINATES, zoom: 10, duration: 350 });
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

interface CompanyLocationModalProps {
  open: boolean;
  mode: "add" | "edit";
  locationForm: UpdateCompanyLocation;
  setLocationForm: React.Dispatch<React.SetStateAction<UpdateCompanyLocation>>;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onOpenChange: (open: boolean) => void;
}

const CompanyLocationModal = ({
  open,
  mode,
  locationForm,
  setLocationForm,
  loading,
  onSave,
  onCancel,
  onOpenChange,
}: CompanyLocationModalProps) => {
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
    () => normalizeOperatingHours(locationForm.operating_hours),
    [locationForm.operating_hours],
  );
  const configuredDays = useMemo(
    () => DAYS_OF_WEEK.filter((day) => selectedOperatingHours[day]),
    [selectedOperatingHours],
  );
  const availableDays = useMemo(
    () => DAYS_OF_WEEK.filter((day) => !selectedOperatingHours[day]),
    [selectedOperatingHours],
  );
  const locationAddress = locationForm.address ?? "";

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
        const baseQuery = /\begypt\b|مصر/i.test(address) ? address : `${address}, Egypt`;
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

        const egyptCandidates = (data.candidates ?? []).filter(
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

        setLocationForm((prev) => {
          const latestAddress = prev.address?.trim();
          if (latestAddress !== address) return prev;

          const currentLng = prev.coordinates?.coordinates?.[0];
          const currentLat = prev.coordinates?.coordinates?.[1];
          if (currentLng === lng && currentLat === lat) return prev;

          return {
            ...prev,
            coordinates: {
              ...prev.coordinates,
              coordinates: [lng, lat],
            },
          };
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
  }, [locationAddress, open, setLocationForm]);

  const handleAddOperatingHour = () => {
    if (!pendingOperatingHour.day) return;
    setLocationForm((prev) => ({
      ...prev,
      operating_hours: {
        ...(prev.operating_hours ?? {}),
        [pendingOperatingHour.day]: {
          open: pendingOperatingHour.open || DEFAULT_OPERATING_HOURS[pendingOperatingHour.day].open,
          close: pendingOperatingHour.close || DEFAULT_OPERATING_HOURS[pendingOperatingHour.day].close,
        },
      },
    }));
  };

  const handleRemoveOperatingHour = (day: string) => {
    setLocationForm((prev) => {
      const next = { ...(prev.operating_hours ?? {}) };
      delete next[day];
      return { ...prev, operating_hours: next };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Location" : "Edit Location"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
            <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Location
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold">Location Name</Label>
                <Input
                  value={locationForm.name}
                  onChange={(e) => setLocationForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Headquarters"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-[9px] font-bold">Location Address</Label>
                <Input
                  value={locationForm.address}
                  onChange={(e) => setLocationForm((prev) => ({ ...prev, address: e.target.value }))}
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
                  lng={locationForm.coordinates.coordinates[0] ?? 0}
                  lat={locationForm.coordinates.coordinates[1] ?? 0}
                  onChange={(lng, lat) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        coordinates: [lng, lat],
                      },
                    }))
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Longitude: {locationForm.coordinates.coordinates[0]?.toFixed(6) ?? "—"} · Latitude:{" "}
                  {locationForm.coordinates.coordinates[1]?.toFixed(6) ?? "—"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold">Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationForm.coordinates.coordinates[0]}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        coordinates: [
                          Number(e.target.value || DEFAULT_LOCATION_COORDINATES[0]),
                          prev.coordinates.coordinates[1],
                        ],
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold">Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  value={locationForm.coordinates.coordinates[1]}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      coordinates: {
                        ...prev.coordinates,
                        coordinates: [
                          prev.coordinates.coordinates[0],
                          Number(e.target.value || DEFAULT_LOCATION_COORDINATES[1]),
                        ],
                      },
                    }))
                  }
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox
                  checked={locationForm.is_primary}
                  onCheckedChange={(checked) => setLocationForm((prev) => ({ ...prev, is_primary: !!checked }))}
                />
                Mark as primary location
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <Checkbox
                  checked={locationForm.active}
                  onCheckedChange={(checked) => setLocationForm((prev) => ({ ...prev, active: !!checked }))}
                />
                Active location
              </label>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-blue-50/20 rounded-lg border border-blue-200/50">
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

            {configuredDays.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-3 items-center">
                <Label className="text-[10px] capitalize">{day}</Label>
                <Input
                  type="time"
                  value={selectedOperatingHours[day]?.open ?? "09:00"}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      operating_hours: {
                        ...(prev.operating_hours ?? {}),
                        [day]: {
                          ...(prev.operating_hours?.[day] ?? DEFAULT_OPERATING_HOURS[day]),
                          open: e.target.value,
                        },
                      },
                    }))
                  }
                />
                <Input
                  type="time"
                  value={selectedOperatingHours[day]?.close ?? "18:00"}
                  onChange={(e) =>
                    setLocationForm((prev) => ({
                      ...prev,
                      operating_hours: {
                        ...(prev.operating_hours ?? {}),
                        [day]: {
                          ...(prev.operating_hours?.[day] ?? DEFAULT_OPERATING_HOURS[day]),
                          close: e.target.value,
                        },
                      },
                    }))
                  }
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
              <p className="text-[10px] text-muted-foreground">No operating hours added yet.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyLocationModal;
