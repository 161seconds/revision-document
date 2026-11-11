export type GeocodePoint = { lat: number; lon: number };

export async function geocodeAddress(
  text: string
): Promise<GeocodePoint | null> {
  const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
  if (!apiKey || !text.trim()) return null;
  const url = new URL("https://maps.vietmap.vn/api/search");
  url.searchParams.set("api-version", "1.1");
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("text", text.trim());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
  const data = await res.json();

  const fromFeatures = data?.features?.[0]?.geometry?.coordinates;
  if (Array.isArray(fromFeatures) && fromFeatures.length >= 2) {
    const [lon, lat] = fromFeatures as [number, number];
    return { lat, lon };
  }

  const wrappedFcCoords = data?.data?.features?.[0]?.geometry?.coordinates;
  if (Array.isArray(wrappedFcCoords) && wrappedFcCoords.length >= 2) {
    const [lon, lat] = wrappedFcCoords as [number, number];
    return { lat, lon };
  }

  const first =
    (Array.isArray(data?.data) ? data.data[0] : data?.result?.[0]) || null;
  if (first && typeof first.lat === "number" && typeof first.lon === "number") {
    return { lat: first.lat, lon: first.lon };
  }
  if (
    first &&
    typeof first.latitude === "number" &&
    typeof first.longitude === "number"
  ) {
    return { lat: first.latitude, lon: first.longitude };
  }
  return null;
}
