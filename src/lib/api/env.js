function trimTrailingSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "/api");

export const authApiBase = `${apiBaseUrl}/auth`;
export const rideApiBase = `${apiBaseUrl}/rides`;
export const rideSocketUrl =
  trimTrailingSlash(import.meta.env.VITE_RIDE_SOCKET_URL) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");
export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
