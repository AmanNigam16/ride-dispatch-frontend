function resolveSocketUrl() {
  const configuredUrl = import.meta.env.VITE_RIDE_SOCKET_URL;

  if (typeof window === "undefined") {
    return configuredUrl || "http://localhost:5002";
  }

  if (!configuredUrl) {
    return window.location.origin;
  }

  const pageProtocol = window.location.protocol;

  if (pageProtocol === "https:" && configuredUrl.startsWith("http://")) {
    return window.location.origin;
  }

  return configuredUrl;
}

export const authApiBase = import.meta.env.VITE_AUTH_API_BASE || "/api/auth";
export const rideApiBase = import.meta.env.VITE_RIDE_API_BASE || "/api/rides";
export const rideSocketUrl = resolveSocketUrl();
export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
