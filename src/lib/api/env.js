function trimTrailingSlash(value) {
  return typeof value === "string" ? value.replace(/\/+$/, "") : value;
}

function shouldForceSameOrigin(value) {
  if (typeof window === "undefined" || !value) {
    return false;
  }

  try {
    const resolvedUrl = new URL(value, window.location.origin);

    return (
      window.location.protocol === "https:" &&
      resolvedUrl.protocol === "http:" &&
      resolvedUrl.hostname !== "localhost" &&
      resolvedUrl.hostname !== "127.0.0.1"
    );
  } catch {
    return false;
  }
}

function getApiBase(envValue, fallbackPath) {
  if (!envValue || shouldForceSameOrigin(envValue)) {
    return fallbackPath;
  }

  return trimTrailingSlash(envValue);
}

function getRideSocketUrl() {
  const envValue = trimTrailingSlash(import.meta.env.VITE_RIDE_SOCKET_URL);

  if (typeof window !== "undefined") {
    if (!envValue || shouldForceSameOrigin(envValue)) {
      return window.location.origin;
    }
  }

  return envValue || "http://localhost:5002";
}

export const authApiBase = getApiBase(import.meta.env.VITE_AUTH_API_BASE, "/api/auth");
export const rideApiBase = getApiBase(import.meta.env.VITE_RIDE_API_BASE, "/api/rides");
export const rideSocketUrl = getRideSocketUrl();
export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";
