"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { db } from "@/data/fakeDb";

// Decode Google Polyline 5 to [lng, lat] coordinates
function decodePolyline5(encoded: string): [number, number][] {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];

  while (index < len) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    const latitude = lat / 1e5;
    const longitude = lng / 1e5;
    coordinates.push([longitude, latitude]);
  }

  return coordinates;
}

type BookingProps = {
  initialAddressText?: string;
  initialCapacity?: number;
  onSelectShop?: (
    shopName: string,
    address: string,
    capacity: number,
    shopData?: { dryingPrice: number; dryingAndStoragePrice: number }
  ) => void;
};

export default function MapClient(props: BookingProps = {}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const userMarkerRef = useRef<vietmapgl.Marker | null>(null);
  const shopMarkersRef = useRef<vietmapgl.Marker[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
  const [isRoutingAll, setIsRoutingAll] = useState(false);
  const [addressText, setAddressText] = useState(
    props.initialAddressText ?? ""
  );
  const [customerCapacity, setCustomerCapacity] = useState<string>(
    props.initialCapacity != null ? String(props.initialCapacity) : ""
  );
  const [eligibleList, setEligibleList] = useState<
    {
      name: string;
      distance: number;
      rating: number;
      capacity: number;
      dryingPrice: number;
      dryingAndStoragePrice: number;
    }[]
  >([]);

  const ROUTES_SOURCE_ID = "routes-source";
  const ROUTES_LAYER_ID = "routes-layer";
  const ROUTES_LAYER_SHORTEST_ID = "routes-layer-shortest";
  const ROUTES_LAYER_ALL_ID = "routes-layer-all";

  // Get shops from fakeDb instead of static data
  const [shops, setShops] = useState<
    {
      STT: number;
      "Tên lò sấy": string;
      "TP/Huyện": string;
      "Địa điểm": string;
      "Tọa độ": number[];
      Rating: number;
      LimitCapacity: number;
      "Giá sấy lúa": number;
      "Giá sấy và bảo quản lúa": number;
    }[]
  >([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dbShops = db.listShops();
      const result = dbShops.map((shop) => ({
        STT: 0, // Not used in this context
        "Tên lò sấy": shop.name,
        "TP/Huyện": shop.district,
        "Địa điểm": shop.address,
        "Tọa độ": shop.coordinates,
        Rating:
          shop.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5–5.0
        LimitCapacity:
          shop.limitCapacity || Math.floor(Math.random() * 1500) + 500, // 500–2000
        "Giá sấy lúa": shop.dryingPrice || 0,
        "Giá sấy và bảo quản lúa": shop.dryingAndStoragePrice || 0,
      }));
      setShops(result);
    }
  }, []);

  // Listen for shop updates
  useEffect(() => {
    const onShopsUpdated = () => {
      if (typeof window !== "undefined") {
        const dbShops = db.listShops();
        const result = dbShops.map((shop) => ({
          STT: 0,
          "Tên lò sấy": shop.name,
          "TP/Huyện": shop.district,
          "Địa điểm": shop.address,
          "Tọa độ": shop.coordinates,
          Rating:
            shop.rating || parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          LimitCapacity:
            shop.limitCapacity || Math.floor(Math.random() * 1500) + 500,
          "Giá sấy lúa": shop.dryingPrice || 0,
          "Giá sấy và bảo quản lúa": shop.dryingAndStoragePrice || 0,
        }));
        setShops(result);
      }
    };

    window.addEventListener("demo:shops-updated", onShopsUpdated);
    return () =>
      window.removeEventListener("demo:shops-updated", onShopsUpdated);
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new vietmapgl.Map({
      container: mapContainerRef.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
      center: [105.89716068989348, 10.377142643969268], // Vietnam centered
      zoom: 12,
    });

    mapInstance.addControl(new vietmapgl.NavigationControl(), "top-right");
    mapRef.current = mapInstance;

    return () => {
      // Clean up shop markers
      shopMarkersRef.current.forEach((marker) => marker.remove());
      shopMarkersRef.current = [];

      mapInstance.remove();
      mapRef.current = null;
    };
  }, [apiKey]);

  // Separate effect to render markers when shops change
  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = mapRef.current;

    // Wait for map to be fully loaded before adding markers
    if (!mapInstance.isStyleLoaded()) {
      mapInstance.on("style.load", () => {
        renderShopMarkers(mapInstance);
      });
    } else {
      renderShopMarkers(mapInstance);
    }

    function renderShopMarkers(map: vietmapgl.Map) {
      // Clear existing shop markers
      shopMarkersRef.current.forEach((marker) => marker.remove());
      shopMarkersRef.current = [];

      if (shops.length === 0) return;

      // Add markers and popups for all shops from data
      const bounds = new vietmapgl.LngLatBounds();
      shops.forEach((shop) => {
        const [lat, lng] = shop["Tọa độ"]; // data is [lat, lng]
        const position: [number, number] = [lng, lat];

        const popupHtml =
          "<div>" +
          `<h4 style="margin:0;font-size:16px;font-weight:600;color:#111827">${shop["Tên lò sấy"]}</h4>` +
          `<div style="font-size:12px;color:#374151;margin-top:4px">${shop["Địa điểm"]}</div>` +
          "</div>";

        const popup = new vietmapgl.Popup({ closeOnClick: false }).setHTML(
          popupHtml
        );

        const marker = new vietmapgl.Marker()
          .setLngLat(position)
          .setPopup(popup)
          .addTo(map);

        shopMarkersRef.current.push(marker);
        bounds.extend(position);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40 });
      }
    }
  }, [shops]);

  const geocodeAddress = useCallback(
    async (text: string): Promise<{ lat: number; lon: number } | null> => {
      if (!apiKey || !text.trim()) return null;
      const url = new URL("https://maps.vietmap.vn/api/search");
      url.searchParams.set("api-version", "1.1");
      url.searchParams.set("apikey", apiKey);
      url.searchParams.set("text", text.trim());

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
      const data = await res.json();
      console.log("Geocode response", data);

      // Try common shapes for Vietmap search results
      // Case A: top-level FeatureCollection
      const fromFeatures = data?.features?.[0]?.geometry?.coordinates;
      if (Array.isArray(fromFeatures) && fromFeatures.length >= 2) {
        const [lon, lat] = fromFeatures as [number, number];
        return { lat, lon };
      }
      // Case B: wrapped in data: { type: 'FeatureCollection', features: [...] }
      const wrappedFcCoords = data?.data?.features?.[0]?.geometry?.coordinates;
      if (Array.isArray(wrappedFcCoords) && wrappedFcCoords.length >= 2) {
        const [lon, lat] = wrappedFcCoords as [number, number];
        return { lat, lon };
      }
      const first =
        (Array.isArray(data?.data) ? data.data[0] : data?.result?.[0]) || null;
      if (
        first &&
        typeof first.lat === "number" &&
        typeof first.lon === "number"
      ) {
        return { lat: first.lat, lon: first.lon };
      }
      if (
        first &&
        typeof first.latitude === "number" &&
        typeof first.longitude === "number"
      ) {
        return { lat: first.latitude, lon: first.longitude };
      }
      throw new Error(`No results for: "${text.trim()}"`);
    },
    [apiKey]
  );

  const placeOrMoveUserMarker = useCallback((lngLat: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat(lngLat);
    } else {
      userMarkerRef.current = new vietmapgl.Marker({ color: "#10B981" })
        .setLngLat(lngLat)
        .addTo(map);
    }
  }, []);

  const clearAllRoutes = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(ROUTES_LAYER_ALL_ID)) map.removeLayer(ROUTES_LAYER_ALL_ID);
    if (map.getLayer(ROUTES_LAYER_SHORTEST_ID))
      map.removeLayer(ROUTES_LAYER_SHORTEST_ID);
    if (map.getLayer(ROUTES_LAYER_ID)) map.removeLayer(ROUTES_LAYER_ID);
    if (map.getSource(ROUTES_SOURCE_ID)) map.removeSource(ROUTES_SOURCE_ID);
  }, []);

  const requestAndDrawRoutesToAllShops = useCallback(
    async (originLat: number, originLon: number) => {
      if (!apiKey || !mapRef.current || shops.length === 0) return;
      setIsRoutingAll(true);
      try {
        const routePromises = shops.map(async (shop) => {
          const [destLat, destLon] = shop["Tọa độ"]; // [lat, lng]
          const url = new URL("https://maps.vietmap.vn/api/route");
          url.searchParams.set("api-version", "1.1");
          url.searchParams.set("apikey", apiKey);
          url.searchParams.append("point", `${originLat},${originLon}`);
          url.searchParams.append("point", `${destLat},${destLon}`);
          url.searchParams.set("vehicle", "car");
          url.searchParams.set("points_encoded", "true");
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error(`Route API failed (${res.status})`);
          const data = await res.json();
          const path = data?.paths?.[0];
          const distance: number = path?.distance ?? Number.POSITIVE_INFINITY;
          const encoded: string | undefined = path?.points;
          if (!encoded || typeof encoded !== "string") {
            console.warn("Unexpected route points shape", path?.points);
            return { shop, coords: [] as [number, number][], distance };
          }
          const coords = decodePolyline5(encoded);
          return { shop, coords, distance };
        });

        const results = await Promise.all(routePromises);
        const valid = results.filter(
          (r) =>
            Array.isArray(r.coords) &&
            r.coords.length > 0 &&
            isFinite(r.distance)
        );
        if (valid.length === 0) throw new Error("No routes found");

        const shortest = valid.reduce((min, cur) =>
          cur.distance < min.distance ? cur : min
        );

        // Build eligible list filtered by LimitCapacity and sorted by distance then rating
        const cap = Number(customerCapacity);
        type ShopLike = Pick<
          (typeof shops)[number],
          | "Rating"
          | "LimitCapacity"
          | "Tên lò sấy"
          | "Giá sấy lúa"
          | "Giá sấy và bảo quản lúa"
        >;
        const filteredSorted = valid
          .filter((r) =>
            Number.isFinite(cap) && cap > 0
              ? ((r.shop as ShopLike).LimitCapacity ?? 0) >= cap
              : true
          )
          .sort((a, b) => {
            if (a.distance !== b.distance) return a.distance - b.distance;
            const ra = (a.shop as ShopLike).Rating ?? 0;
            const rb = (b.shop as ShopLike).Rating ?? 0;
            return rb - ra;
          })
          .map((r) => ({
            name: (r.shop as ShopLike)["Tên lò sấy"],
            distance: r.distance,
            rating: (r.shop as ShopLike).Rating ?? 0,
            capacity: (r.shop as ShopLike).LimitCapacity ?? 0,
            dryingPrice: (r.shop as ShopLike)["Giá sấy lúa"] ?? 0,
            dryingAndStoragePrice:
              (r.shop as ShopLike)["Giá sấy và bảo quản lúa"] ?? 0,
          }));
        setEligibleList(filteredSorted);

        // Build FeatureCollection
        type LineFeature = {
          type: "Feature";
          geometry: { type: "LineString"; coordinates: [number, number][] };
          properties: { distance: number; isShortest: boolean; name: string };
        };
        const features: LineFeature[] = valid.map((r) => ({
          type: "Feature",
          geometry: { type: "LineString", coordinates: r.coords },
          properties: {
            distance: r.distance,
            isShortest: r === shortest,
            name: r.shop["Tên lò sấy"],
          },
        }));
        type FeatureCollection = {
          type: "FeatureCollection";
          features: LineFeature[];
        };
        const fc: FeatureCollection = { type: "FeatureCollection", features };

        const map = mapRef.current;
        if (!map) return;

        clearAllRoutes();

        map.addSource(ROUTES_SOURCE_ID, { type: "geojson", data: fc });
        // Draw ALL routes as base layer (thin, gray) so every route is visible
        map.addLayer({
          id: ROUTES_LAYER_ALL_ID,
          type: "line",
          source: ROUTES_SOURCE_ID,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#2563EB",
            "line-width": 3.5,
            "line-opacity": 0.8,
          },
        });
        // Shortest on top (thicker, blue) for emphasis
        map.addLayer({
          id: ROUTES_LAYER_SHORTEST_ID,
          type: "line",
          source: ROUTES_SOURCE_ID,
          filter: ["==", ["get", "isShortest"], true],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#e10a0a",
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });

        // Fit bounds to all routes
        const allCoords = valid.flatMap((r) => r.coords);
        const b = allCoords.reduce(
          (acc, c) => acc.extend(c),
          new vietmapgl.LngLatBounds()
        );
        if (!b.isEmpty()) map.fitBounds(b, { padding: 50 });
      } finally {
        setIsRoutingAll(false);
      }
    },
    [apiKey, clearAllRoutes, customerCapacity, shops]
  );

  const onSubmitAddress = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!apiKey) {
        alert("Missing API key");
        return;
      }
      if (!addressText.trim()) return;
      try {
        const geo = await geocodeAddress(addressText);
        console.log("Geocode result", geo);
        if (!geo) {
          alert("Address not found");
          return;
        }
        const lngLat: [number, number] = [geo.lon, geo.lat];
        const map = mapRef.current;
        if (!map) return;
        placeOrMoveUserMarker(lngLat);
        map.flyTo({ center: lngLat, zoom: 12 });
        await requestAndDrawRoutesToAllShops(geo.lat, geo.lon);
      } catch (err) {
        console.error(err);
        alert((err as Error).message || "Failed to geocode");
      }
    },
    [
      apiKey,
      addressText,
      geocodeAddress,
      placeOrMoveUserMarker,
      requestAndDrawRoutesToAllShops,
    ]
  );

  return (
    <div className="min-h-[100vh] flex flex-col">
      <div className="px-4 py-3 border-b">
        {!apiKey && (
          <p className="text-sm text-red-600">
            Missing NEXT_PUBLIC_VIETMAP_API_KEY. Add it to your env and reload.
          </p>
        )}
        {apiKey && !props.initialAddressText && (
          <div className="mt-2 flex items-center gap-2">
            <form
              onSubmit={onSubmitAddress}
              className="flex items-center gap-2"
            >
              <input
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                placeholder="Nhập Địa Chỉ"
                className="text-black px-3 py-1.5 border rounded text-sm w-[320px]"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={customerCapacity}
                onChange={(e) => setCustomerCapacity(e.target.value)}
                placeholder="Công suất (Tấn/ngày)"
                className="text-black px-3 py-1.5 border rounded text-sm w-[180px]"
              />
              <button
                type="submit"
                disabled={isRoutingAll}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm disabled:opacity-60"
              >
                {isRoutingAll ? "Đang tìm lò sấy..." : "Tìm lò sấy"}
              </button>
            </form>
          </div>
        )}
        {apiKey && props.initialAddressText && (
          <div className="mt-2 text-center text-slate-600 text-sm">
            Nhập địa chỉ và sản lượng ở form bên trái để tìm lò sấy phù hợp
          </div>
        )}
      </div>
      <div className="h-[100vh] relative">
        <div ref={mapContainerRef} id="map" className="w-full h-full" />
        <div className="absolute top-26 right-4 w-80 max-h-[80vh] overflow-auto bg-white/95 backdrop-blur-sm border rounded shadow text-sm">
          <div className="px-3 py-2 border-b font-semibold">Lò sấy phù hợp</div>
          {eligibleList.length === 0 ? (
            <div className="px-3 py-2 text-gray-600">
              Nhập địa chỉ và sản lượng, sau đó nhấn Tìm lò sấy.
            </div>
          ) : (
            <ul className="divide-y">
              {eligibleList.map((s, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    props.onSelectShop?.(
                      s.name,
                      addressText,
                      Number(customerCapacity),
                      {
                        dryingPrice: s.dryingPrice,
                        dryingAndStoragePrice: s.dryingAndStoragePrice,
                      }
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="truncate text-black font-medium"
                      title={s.name}
                    >
                      {s.name}
                    </span>
                    <span className="shrink-0 text-gray-700 text-xs">
                      {(s.distance / 1000).toFixed(1)} km · {s.rating}★
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    <div>
                      Công suất: {s.capacity} Tấn · Giá sấy:{" "}
                      {(s.dryingPrice || 0).toLocaleString("vi-VN")} VND/Tấn
                    </div>
                    <div>
                      Giá Sấy + Bảo Quản:{" "}
                      {(s.dryingAndStoragePrice || 0).toLocaleString("vi-VN")}{" "}
                      VND/Tấn
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
