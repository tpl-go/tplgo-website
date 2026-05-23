"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

type Place = {
  name: string;
  lat: number;
  lng: number;
  day?: string;
};

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (!places?.length) return;

    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [places, map]);

  return null;
}

export default function RouteMap({ places }: { places: Place[] }) {
  const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const center: [number, number] = places?.length ? [places[0].lat, places[0].lng] : [20.5937, 78.9629];
  const line = places.map((p) => [p.lat, p.lng]) as [number, number][];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer center={center} zoom={6} scrollWheelZoom className="w-full h-full">
        <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FitBounds places={places} />

        {places.map((p, idx) => (
          <Marker key={idx} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.name}</div>
                {p.day ? <div className="text-xs text-gray-600">{p.day}</div> : null}
              </div>
            </Popup>
          </Marker>
        ))}

        {line.length >= 2 ? <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 4 }} /> : null}
      </MapContainer>
    </div>
  );
}