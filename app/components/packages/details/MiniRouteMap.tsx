"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Place = {
  name: string;
  lat: number;
  lng: number;
  day?: string;
};

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (!places || places.length === 0) return;

    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 8);
      return;
    }

    const bounds = L.latLngBounds(
      places.map((p) => [p.lat, p.lng] as [number, number])
    );

    map.fitBounds(bounds, {
      padding: [20, 20],
    });
  }, [map, places]);

  return null;
}

export default function MiniRouteMap({ places }: { places: Place[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validPlaces = useMemo(() => {
    return (places || []).filter(
      (p) =>
        p &&
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        !Number.isNaN(p.lat) &&
        !Number.isNaN(p.lng)
    );
  }, [places]);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
        Loading map...
      </div>
    );
  }

  if (!validPlaces || validPlaces.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
        Map placeholder
      </div>
    );
  }

  const fallbackCenter: [number, number] = [
    validPlaces[0].lat,
    validPlaces[0].lng,
  ];

  const line = validPlaces.map((p) => [p.lat, p.lng]) as [number, number][];

  return (
    <MapContainer
      key={JSON.stringify(line)}
      center={fallbackCenter}
      zoom={7}
      className="w-full h-full"
      zoomControl={false}
      dragging={true}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds places={validPlaces} />

      {validPlaces.map((p, index) => (
        <Marker
          key={`${p.name}-${p.lat}-${p.lng}-${index}`}
          position={[p.lat, p.lng]}
        />
      ))}

      {line.length > 1 && <Polyline positions={line} />}
    </MapContainer>
  );
}