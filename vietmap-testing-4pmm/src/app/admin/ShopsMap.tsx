"use client";

import { useEffect, useRef } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { db } from "@/data/fakeDb";

export default function ShopsMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const mapInstance = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
      center: [105.89716068989348, 10.377142643969268],
      zoom: 8,
    });
    mapInstance.addControl(new vietmapgl.NavigationControl(), "top-right");
    mapRef.current = mapInstance;

    const renderMarkers = () => {
      const shops = db.listShops();
      const bounds = new vietmapgl.LngLatBounds();
      shops.forEach((s) => {
        const [lat, lon] = s.coordinates;
        const position: [number, number] = [lon, lat];
        const popupHtml =
          "<div>" +
          `<h4 style=\"margin:0;font-size:14px;font-weight:600;color:#111827\">${s.name}</h4>` +
          `<div style=\"font-size:12px;color:#374151;margin-top:4px\">${s.address}</div>` +
          "</div>";
        const popup = new vietmapgl.Popup({ closeOnClick: false }).setHTML(
          popupHtml
        );
        new vietmapgl.Marker()
          .setLngLat(position)
          .setPopup(popup)
          .addTo(mapInstance);
        bounds.extend(position);
      });
      if (!bounds.isEmpty()) mapInstance.fitBounds(bounds, { padding: 40 });
    };

    renderMarkers();

    const onUpdated = () => {
      // For simplicity, recreate markers by resetting the map style (clears markers)
      renderMarkers();
    };
    window.addEventListener("demo:shops-updated", onUpdated);
    return () => {
      mapInstance.remove();
      mapRef.current = null;
      window.removeEventListener("demo:shops-updated", onUpdated);
    };
  }, [apiKey]);
  return <div ref={mapContainerRef} className="w-full h-[70vh]" />;
}
