export const authApiBase = import.meta.env.VITE_AUTH_API_BASE || "/api/auth";
export const rideApiBase = import.meta.env.VITE_RIDE_API_BASE || "/api/rides";
export const rideSocketUrl =
  import.meta.env.VITE_RIDE_SOCKET_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5002");
export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
