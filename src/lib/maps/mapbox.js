import { mapboxToken } from "../api/env";

function encode(value) {
  return encodeURIComponent(value.trim());
}

export function hasMapboxToken() {
  return Boolean(mapboxToken);
}

export async function searchLocations(query) {
  if (!mapboxToken || !query?.trim()) {
    return [];
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encode(
    query
  )}.json?autocomplete=true&limit=5&access_token=${mapboxToken}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  return (data.features || []).map((feature) => ({
    id: feature.id,
    label: feature.place_name,
    lat: feature.center?.[1],
    lng: feature.center?.[0]
  }));
}

export async function geocodeLocationLabel(label) {
  if (!mapboxToken || !label?.trim()) {
    return null;
  }

  const matches = await searchLocations(label);
  return matches[0] || null;
}
